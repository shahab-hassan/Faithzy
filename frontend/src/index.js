import ReactDOM from "react-dom/client"
import {BrowserRouter} from "react-router-dom"
import {SnackbarProvider} from "notistack"

import App from "./App"
import "./styles/utils.css"
import "./styles/buyer.css"
import "./styles/seller.css"
import "./styles/common.css"
import { AuthProvider } from "./utils/AuthContext"

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <SnackbarProvider>
            <AuthProvider>
                <App/>
            </AuthProvider>
        </SnackbarProvider>
    </BrowserRouter>
)