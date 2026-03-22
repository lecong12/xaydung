import React, { createContext, useContext, useReducer, type ReactNode } from 'react';

// Define types locally
interface Project {
  id?: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  completionPercentage?: number;
  workItems?: WorkItem[];
}

interface WorkItem {
  id?: string;
  project_id: string;
  name: string;
  description?: string;
  unit: string;
  design_quantity: number;
  completed_quantity?: number;
  unit_price: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// State interface
interface AppState {
  projects: Project[];
  currentProject: Project | null;
  workItems: WorkItem[];
  loading: boolean;
  error: string | null;
}

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'SET_WORK_ITEMS'; payload: WorkItem[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_WORK_ITEM'; payload: WorkItem };

// Initial state
const initialState: AppState = {
  projects: [],
  currentProject: null,
  workItems: [],
  loading: false,
  error: null
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload, loading: false };
    case 'SET_WORK_ITEMS':
      return { ...state, workItems: action.payload, loading: false };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload], loading: false };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? action.payload : p),
        currentProject: state.currentProject?.id === action.payload.id ? action.payload : state.currentProject,
        loading: false
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        currentProject: state.currentProject?.id === action.payload ? null : state.currentProject,
        loading: false
      };
    case 'ADD_WORK_ITEM':
      return { ...state, workItems: [...state.workItems, action.payload], loading: false };
    default:
      return state;
  }
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;