import React from "react";
import DOMPurify from "dompurify";
import { sanitizeUrl } from "@braintree/sanitize-url";

import { Node } from "../App";

const Details = ({ node }: { node: Node }) => {
  const { title} = node;

  return (
    <div>
      <h2>{title}</h2>

      {(node.content || []).map((content, index) => {
        if (content.type === "text") {
          const cleanText = DOMPurify.sanitize(content.body);

          if (!cleanText) return null;

          return (
            <p
              dangerouslySetInnerHTML={{
                __html: cleanText,
              }}
              key={index}
            />
          );
        }

        if (content.type === "image") {
          // To do: make sure URL is safe and render <img />
          return <img src={sanitizeUrl(content.url)} alt="" key={index} />;
        }

        return null;
      })}
    </div>
  );
};

export default Details;
