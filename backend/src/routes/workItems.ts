import { Router } from 'express';
import { 
  getAllWorkItems, 
  getWorkItemById, 
  updateWorkItem, 
  deleteWorkItem 
} from '../controllers/workItemController';

const router = Router();

router.get('/', getAllWorkItems);
router.get('/:id', getWorkItemById);
router.put('/:id', updateWorkItem);
router.delete('/:id', deleteWorkItem);

export default router;