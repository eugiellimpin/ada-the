import ky from "ky";
import React, { useEffect, useState } from "react";

import "./App.css";

interface Node {
  id: string;
  title: string;
}

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    const fetchNodes = async () => {
      const fetchedNodes: Node[] = await ky.get("/nodes").json();
      setNodes(fetchedNodes);
    };

    fetchNodes();
  }, []);

  return (
    <div className="">
      <ul>
        {nodes.map(({ id, title }) => (
          <li key={id}>{title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
