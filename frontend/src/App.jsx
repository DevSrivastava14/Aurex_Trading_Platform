import { useEffect, useState } from "react";
import axios from "axios";

function App() {
    const [status, setStatus] = useState("Connecting...");

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/health")
            .then((response) => {
                setStatus(response.data.message);
            })
            .catch(() => {
                setStatus("Backend connection failed");
            });
    }, []);

    return (
        <div>
            <h1>AUREX</h1>
            <p>Paper Trading Platform</p>

            <h2>{status}</h2>
        </div>
    );
}

export default App;