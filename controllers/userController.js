import { User } from '../models/User.js';
import { Order } from '../models/Order.js';


export const getUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId) {
      // Fetch single user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ user });
    }

    // Fetch all users
    const users = await User.find({});
    return res.status(200).json({ users });

  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const id = Number(userId);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
        const populateFields = [
      "uploaded_images",
      "phase_3",
      "phase_2.uploaded_images_mode1",
      "phase_2.uploaded_images_cuisine",
      "phase_2.uploaded_images_chambre_oui2",
      "phase_2.uploaded_images_chambre2",
    ];

    // Find all orders for this user, and populate the uploaded_images
    const orders = await Order.find({ userId: id })
      .populate(populateFields) // populate referenced UploadedImage docs
      .sort({ createdAt: -1 }); // newest first

    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    return res.status(200).json({ orders });

  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// export const getOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate({
//         path: 'userId',
//         model: User,
//         select: 'userId userName userEmail' // only select the fields you need
//       });

//     res.status(200).json({ orders });
//   } catch (error) {
//     console.error('Order GET error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// export const updateOrder = async (req, res) => {
//   const { orderId } = req.params;
//   const updates = req.body;

//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(orderId, updates, {
//       new: true,
//       runValidators: true
//     });

//     if (!updatedOrder) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     res.status(200).json({
//       message: 'Order updated successfully',
//       order: updatedOrder
//     });

//   } catch (error) {
//     console.error('Update error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
