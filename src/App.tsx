import ky from "ky";
import DOMPurify from "dompurify";
import React, { useEffect, useState } from "react";
import { sanitizeUrl } from "@braintree/sanitize-url";

import "./App.css";

interface ImageContent {
  type: "image";
  url: string;
}

interface TextContent {
  type: "text";
  body: string;
}

interface Node {
  id: number;
  title: string;
  connections?: number[];
  content?: Array<TextContent | ImageContent>;
}

interface NodesById {
  [id: string]: Node;
}

const getNodes = (nodesById: NodesById, ids: number[]) => {
  return ids.map((id) => nodesById[id]);
};

interface NodeItemProps {
  activePath: string;
  path: number[];
  node: Node;
  onClick: (id: number, path: number[]) => void;
  depth?: number;
  getConnections: (ids: number[]) => Node[];
}

const NodeItem = ({
  activePath,
  path,
  node,
  onClick,
  depth = 0,
  getConnections,
}: NodeItemProps) => {
  const { id, title, connections } = node;
  const [isOpen, setIsOpen] = useState(path.join("-") === activePath);

  useEffect(() => {
    if (!!activePath) {
      setIsOpen(activePath.startsWith(path.join("-")));
    }
  }, [activePath, path]);

  return (
    <div key={id} className={`node depth-${depth}`}>
      <button
        onClick={() => {
          onClick(id, path);
        }}
      >
        {id} {title}
      </button>
      {isOpen &&
        depth < 2 &&
        getConnections(connections || []).map((n) => {
          return (
            <NodeItem
              activePath={activePath}
              path={[...path, n.id]}
              node={n}
              onClick={onClick}
              depth={depth + 1}
              getConnections={getConnections}
              key={n.id}
            />
          );
        })}
    </div>
  );
};

function App() {
  const [nodesById, setNodesById] = useState<NodesById>({});
  const [activeNodeIdPath, setActiveNodeIdPath] = useState<number[]>([]);
  const activeNodeId = activeNodeIdPath[activeNodeIdPath.length - 1];

  const fetchNode = async (id: number) => {
    // This endpoint returns an array that contains only one node
    const [fetchedNode] = await ky.get(`/nodes/${id}`).json();
    console.assert(fetchNode.length === 1);

    setNodesById((prev) => ({
      ...prev,
      [fetchedNode.id]: fetchedNode,
    }));
  };

  useEffect(() => {
    const fetchNodes = async () => {
      const fetchedNodes: Node[] = await ky.get("/nodes").json();
      const nodesById = fetchedNodes.reduce((db, node) => {
        db[node.id] = node;
        return db;
      }, {} as NodesById);

      setNodesById(nodesById);
    };

    fetchNodes();
  }, []);

  return (
    <div className="">
      <div className="sidebar">
        {Object.values(nodesById).map((node) => (
          <NodeItem
            activePath={activeNodeIdPath.join("-")}
            path={[node.id]}
            node={node}
            onClick={(id: number, path: number[]) => {
              setActiveNodeIdPath(path);
              fetchNode(id);
            }}
            getConnections={(ids: number[]) => getNodes(nodesById, ids)}
            key={node.id}
          />
        ))}
      </div>
      <div className="details">
        {activeNodeId}

        {(nodesById[activeNodeId]?.content || []).map((content) => {
          if (content.type === "text") {
            const cleanText = DOMPurify.sanitize(content.body);

            if (!cleanText) return null;

            return (
              <p
                dangerouslySetInnerHTML={{
                  __html: cleanText,
                }}
              />
            );
          }

          if (content.type === "image") {
            // To do: make sure URL is safe and render <img />
            return <img src={sanitizeUrl(content.url)} alt="" />;
          }

          return null;
        })}
      </div>
    </div>
  );
}

export default App;
