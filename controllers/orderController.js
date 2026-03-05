import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { UploadedImage } from '../models/UploadedImage.js';
import fs from 'fs';
import path from 'path';
import { sendPhase2Email } from '../send-mail/(user)/on-phase2-complete.js';
import { oncalendlybooked } from '../send-mail/(admin)/on-calendly-booked.js';
import { onPhase1Complete } from '../send-mail/(admin)/on-phase1-complete.js';
import { onNewPayment } from '../send-mail/(admin)/on-new-payment-made.js';
import { onGeomtryProduct } from '../send-mail/(user)/on-Geomtry-product.js';
import { sendconfirmationEmail } from '../send-mail/(user)/another-confirmation.js';
export const getOrders = async (req, res) => {
  try {
    const { orderId } = req.params;
    const populateFields = [
      "uploaded_images",
      "phase_3",
      "phase_2.uploaded_images_mode1",
      "phase_2.uploaded_images_cuisine",
      "phase_2.uploaded_images_chambre_oui2",
      "phase_2.uploaded_images_chambre2",
    ];

    if (orderId) {
      // Fetch single order
      const order = await Order.findOne({ orderId: orderId }).populate(populateFields).populate({
        path: "userId", // alias field in schema
        model: "User",
        localField: "userId",  // field in Order
        foreignField: "userId", // field in User
        justOne: true
      }).sort({ createdAt: -1 });;
      if (!order) {
        return res.status(404).json({ message: 'order not found' });
      }
      return res.status(200).json({ order });
    }

    // Fetch all orders
    const orders = await Order.find({}).populate(populateFields) // populate referenced UploadedImage docs
      .populate({
        path: "userId", // alias field in schema
        model: "User",
        localField: "userId",  // field in Order
        foreignField: "userId", // field in User
        justOne: true
      }).sort({ createdAt: -1 }); // newest first;
    return res.status(200).json({ orders });

  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find order
    const order = await Order.findOne({ orderId: Number(orderId) });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    await Order.deleteOne({ orderId: Number(orderId) });
    // Get all related files
    const files = await UploadedImage.find({ _id: { $in: order.uploaded_images } });

    // Delete files from server
    for (const file of files) {
      try {
        const filePath = path.join(process.cwd(), 'uploads', path.basename(file.path));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error(`Failed to delete file ${file.path}:`, err);
      }
    }

    // Remove files from DB
    await UploadedImage.deleteMany({ _id: { $in: order.uploaded_images } });

    // Remove order from DB
    //  await Order.deleteOne({ orderId: Number(orderId) });

    return res.json({ message: 'Order and related files deleted successfully' });

  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Add a new order phase 1
// with user creation if not exists
export const submitOrder = async (req, res) => {
  try {
    const {
      user,
      step1Data,
      step2Data,
      step3Data,
      step4Data,
      step5Data,
      step6Data,
      step7Data,
      step8Data,
      step9Data,
      totalBudgetEstimate,
      wooOrderData
    } = req.body;

    if (!user?.id || !user?.email) {
      return res.status(400).json({ message: "User ID and Email are required" });
    }

    // 1️⃣ Check if user already exists (by email)
    let existingUser = await User.findOne({ userEmail: user.email });

    // If not found, create a new user
    if (!existingUser) {
      existingUser = await User.create({
        userId: user.id,
        userName: user.name || "",
        userEmail: user.email
      });
    } else {
      // Ensure userId matches existing record
      if (existingUser.userId !== user.id) {
        return res.status(400).json({ message: "This email is already linked to a different userId" });
      }
    }

    // 2️⃣ Check if order already exists (by orderId or userId)
    const duplicateOrder = await Order.findOne({
      $or: [
        { userId: user.id }
      ]
    });

    if (duplicateOrder) {
      return res.status(400).json({ message: "Order with this ID or User already exists" });
    }

    // 3️⃣ Create new order
    const savedOrder = await Order.create({
      userId: user.id,

      // Step 1
      type_bien: step1Data?.type_bien || "",
      statut_bien: step1Data?.statut_bien || "",
      autres_statut_text: step1Data?.autres_statut_text || "",

      // Step 2
      surface_interieure: parseFloat(step2Data?.surface_interieure) || 0,
      surface_exterieure: parseFloat(step2Data?.surface_exterieure) || 0,
      nb_pieces: parseInt(step2Data?.nb_pieces) || 0,

      // Step 3
      objectifs: step3Data?.objectifs || [],
      problemes: step3Data?.problemes || [],
      autre_probleme_text: step3Data?.autre_probleme_text || [],

      // Step 4
      budget_option: step4Data?.budget_option || "",
      total_budget_estimate: parseFloat(step4Data?.total_budget_estimate) || 0,

      // Step 5
      espaces: step5Data?.espaces?.map(space => ({
        value: space.value,
        total_m2: parseFloat(space.total_m2) || 0,
        nb_pieces: parseInt(space.nb_pieces) || 0
      })) || [],

      // Step 6
      selected_styles: step6Data?.selected_styles || [],

      // Step 7
      selected_colors: step7Data?.selected_colors || [],

      // Step 8
      selected_subjects: step8Data?.selected_subjects || [],

      // Step 9
      images_reactions: step9Data?.map(img => ({
        imageUrl: img.imageUrl,
        reaction: img.reaction
      })) || [],
      // WooCommerce order
      orderId: wooOrderData?.orderId || 0,
      status: wooOrderData?.status || "",
      total: wooOrderData?.total || totalBudgetEstimate || "",
      currency: wooOrderData?.currency || "",
      date: wooOrderData?.date || null,
      billing: wooOrderData?.billing || {},
      items: wooOrderData?.items || []
    });
    await onPhase1Complete(existingUser, savedOrder);
    await sendconfirmationEmail(savedOrder);
    // 4️⃣ Send success response
    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder
    });

  } catch (error) {
    console.error("❌ Order POST error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};



export const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { phase_2 } = req.body;

  try {
    // 1️⃣ Validate orderId
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid orderId. Must be a number." });
    }

    // 2️⃣ Ensure phase_2 data is provided
    if (!phase_2 || typeof phase_2 !== "object") {
      return res.status(400).json({ message: "phase_2 must be an object with keys/values to update." });
    }

    // 3️⃣ Find order
    const user = await User.findOne({ userId: Number(orderId) });
    if (!user) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 3️⃣ Find order
    const order = await Order.findOne({ userId: Number(user.userId) });
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // 🚀 Robust fix for phase_2 data corruption
    // Ensure phase_2 is a valid object before proceeding
    if (!order.phase_2 || typeof order.phase_2 !== "object" || Array.isArray(order.phase_2)) {
      order.phase_2 = {
        content: {},
        uploaded_images_mode1: [],
        uploaded_images_cuisine: [],
        uploaded_images_chambre_oui2: [],
        uploaded_images_chambre2: []
      };
    }

    // Ensure phase_2.content is a valid object
    if (!order.phase_2.content || typeof order.phase_2.content !== "object" || Array.isArray(order.phase_2.content)) {
      order.phase_2.content = {};
    }

    Object.keys(phase_2).forEach(key => {
      order.phase_2.content[key] = phase_2[key];
    });

    const savedOrder = await order.save();
    await sendPhase2Email(user.userId, phase_2?.content?.calendlyEvent?.event?.uri);
    await oncalendlybooked(order.orderId, phase_2?.content?.calendlyEvent?.event?.uri);
    res.status(200).json({
      message: "Phase 2 details updated successfully",
      order: savedOrder
    });

  } catch (error) {
    console.error("❌ Update Phase 2 Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const updatePaymentDetail = async (req, res) => {
  const { orderId } = req.params;
  const { wooOrderData } = req.body;

  try {
    // 1️⃣ Validate orderId
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid userId. Must be a number." });
    }

    if (!wooOrderData || typeof wooOrderData !== "object") {
      return res.status(400).json({ message: "wooOrderData must be an object" });
    }

    // 2️⃣ Update order by userId
    const order = await Order.findOneAndUpdate(
      { userId: Number(orderId) },
      {
        $set: {
          orderId: wooOrderData.orderId,
          status: wooOrderData.status,
          total: wooOrderData.total,
          currency: wooOrderData.currency,
          date: wooOrderData.date,
          billing: wooOrderData.billing,
          items: wooOrderData.items,
        },
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    let existingUser = await User.findOne({ userId: Number(orderId) });
    let savedOrder = order;
    const hasGeometryProduct = savedOrder.items.some(
      (item) => Number(item.product_id) === 12751
    );
    if (!hasGeometryProduct) {
      await onGeomtryProduct(existingUser);
    }
    await onNewPayment(existingUser, savedOrder);
    // ✅ Success response
    res.status(200).json({
      message: "Order updated successfully",
      order,
    });

  } catch (error) {
    console.error("❌ Update Payment Detail Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const handleFinalizedStatus = async (req, res, field, action) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ orderId: Number(orderId) });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (action === "toggle") {
      order[field] = !order[field];
      await order.save();

      return res.status(200).json({
        orderId: order._id,
        [field]: order[field],
        message: `Project status toggled to ${order[field]}`,
      });
    }

    // 👀 Get action
    if (action === "get") {
      return res.status(200).json({
        [field]: order[field],
      });
    }

    // ❌ Invalid usage fallback
    return res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error("Error handling project status:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const toggleFinalizedAdmin = (req, res) =>
  handleFinalizedStatus(req, res, "isProjectFinalizedAdmin", "toggle");

export const getIsFinalizedAdmin = (req, res) =>
  handleFinalizedStatus(req, res, "isProjectFinalizedAdmin", "get");

export const toggleFinalizedUser = (req, res) =>
  handleFinalizedStatus(req, res, "isProjectFinalizedUser", "toggle");

export const getIsFinalizedUser = (req, res) =>
  handleFinalizedStatus(req, res, "isProjectFinalizedUser", "get");

const deepMerge = (target, source) => {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
};

const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

export const updateOrderPhase2 = async (req, res) => {
  const { orderId } = req.params;
  const { phase_2 } = req.body;

  try {
    // ✅ 1. Validate orderId
    const parsedOrderId = Number(orderId);
    if (isNaN(parsedOrderId) || parsedOrderId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid orderId. Must be a positive number."
      });
    }

    // ✅ 2. Validate phase_2 data
    if (!phase_2 || typeof phase_2 !== "object" || Array.isArray(phase_2)) {
      return res.status(400).json({
        success: false,
        message: "phase_2 must be a valid object with keys/values to update."
      });
    }

    // Check if phase_2 is empty
    if (Object.keys(phase_2).length === 0) {
      return res.status(400).json({
        success: false,
        message: "phase_2 cannot be empty. Provide at least one field to update."
      });
    }

    // ✅ 3. Find user
    const user = await User.findOne({ userId: parsedOrderId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with orderId ${parsedOrderId} not found.`
      });
    }

    // ✅ 4. Find order
    const order = await Order.findOne({ userId: user.userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found for userId ${user.userId}.`
      });
    }

    // ✅ 5. Initialize phase_2 structure if it doesn't exist or is corrupted
    if (!order.phase_2 || typeof order.phase_2 !== "object" || Array.isArray(order.phase_2)) {
      order.phase_2 = {
        content: {},
        uploaded_images_mode1: [],
        uploaded_images_cuisine: [],
        uploaded_images_chambre_oui2: [],
        uploaded_images_chambre2: []
      };
    }

    // Ensure content object exists and is not a string/array
    if (!order.phase_2.content || typeof order.phase_2.content !== "object" || Array.isArray(order.phase_2.content)) {
      order.phase_2.content = {};
    }

    // ✅ 6. Deep merge phase_2 data into order.phase_2.content
    // This preserves all existing nested data while updating/adding new fields
    order.phase_2.content = deepMerge(order.phase_2.content, phase_2);

    // Mark the nested path as modified for Mongoose
    order.markModified('phase_2.content');

    // ✅ 7. Save the order
    const savedOrder = await order.save();

    // ✅ 8. Send email notification if Calendly event exists
    // Check multiple possible locations for calendlyEvent
    const calendlyEventUri =
      phase_2?.calendlyEvent?.event?.uri ||
      phase_2?.userJourney?.calendlyEvent?.event?.uri ||
      order.phase_2.content?.calendlyEvent?.event?.uri;

    if (calendlyEventUri) {
      try {
        await Promise.all([
          sendPhase2Email(user.userId, calendlyEventUri),
          oncalendlybooked(order.orderId, calendlyEventUri)
        ]);
      } catch (emailError) {
        console.error("⚠️ Email/Calendly notification error:", emailError);
        // Don't fail the request if email fails - just log it
      }
    }

    // ✅ 9. Return success response (same format as old API)
    res.status(200).json({
      message: "Phase 2 details updated successfully",
      order: savedOrder
    });

  } catch (error) {
    console.error("❌ Update Phase 2 Error:", error);

    // Handle specific Mongoose errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid data type provided"
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: "Server error occurred while updating order",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
