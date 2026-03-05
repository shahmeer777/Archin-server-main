import express from 'express';
// Importing controllers
import { submitOrder, getOrders, updateOrder , deleteOrder, updatePaymentDetail, toggleFinalizedAdmin, updateOrderPhase2,
  toggleFinalizedUser,  getIsFinalizedAdmin, getIsFinalizedUser} from '../controllers/orderController.js';
import { getUsers , getUserOrders  } from '../controllers/userController.js';
import { uploadOrderFiles, uploadOrderFilesChambre2, uploadOrderFilesChambreOui2, uploadOrderFilesCuisine, uploadOrderFilesMode1, uploadadminFiles, uploaduserFiles } from '../controllers/imageController.js';
import { addUserFeedback, addAdminFeedback, getFeedback, getMainAdminFeedback } from '../controllers/feedbackController.js';
import timeoutMiddleware from '../middleware/timeoutMiddleware.js';

const router = express.Router();


//User
router.get('/user/:userId', getUsers);
router.get('/users/', getUsers);

//Orders
router.get('/orders/:orderId', getOrders);
router.get('/orders', getOrders);

// DELETE order by ID
router.delete('/orders/:orderId', deleteOrder);

// //User With Orders
router.get('/user/:userId/orders', getUserOrders);


// Upload multiple images for an order (Base64 JSON format)
router.post('/orders/:orderId/upload-images', timeoutMiddleware(5 * 60 * 1000), uploadOrderFiles);
router.post('/upload/admin-files', timeoutMiddleware(5 * 60 * 1000),  uploadadminFiles);
router.post('/upload/user-files', timeoutMiddleware(5 * 60 * 1000),  uploaduserFiles);
router.post('/feedbacks/:orderId/user', addUserFeedback);
router.post('/feedbacks/:orderId/admin', addAdminFeedback);
router.get('/feedbacks/:orderId', getFeedback);
router.get('/feedbacks/:orderId/MainAdminFeedback', getMainAdminFeedback);
router.post('/upload/:orderId/upload-model1', timeoutMiddleware(5 * 60 * 1000),  uploadOrderFilesMode1);
router.post('/upload/:orderId/upload-cuisine', timeoutMiddleware(5 * 60 * 1000),  uploadOrderFilesCuisine);
router.post('/upload/:orderId/upload-oui2', timeoutMiddleware(5 * 60 * 1000),  uploadOrderFilesChambreOui2);
router.post('/upload/:orderId/upload-chambre2', timeoutMiddleware(5 * 60 * 1000),  uploadOrderFilesChambre2);



router.post('/submit-order', submitOrder);
router.patch('/update-order/:orderId/phase-2', updateOrderPhase2);
router.patch('/update-order/:orderId', updateOrder);
router.patch('/payment-detail/:orderId', updatePaymentDetail);
router.get("/finalize/:orderId/admin", getIsFinalizedAdmin);
router.get("/finalize/:orderId/user", getIsFinalizedUser);
router.post("/finalize/:orderId/admin/toggle", toggleFinalizedAdmin);
router.post("/finalize/:orderId/user/toggle", toggleFinalizedUser);

export default router;
