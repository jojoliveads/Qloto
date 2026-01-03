import { Provider } from "react-redux";
import { store, persistor } from './store/store' // Added persistor
import { PersistGate } from 'redux-persist/integration/react'; // Added import

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    )
}