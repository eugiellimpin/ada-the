import React from "react";
import DOMPurify from "dompurify";
import { sanitizeUrl } from "@braintree/sanitize-url";

import { Node } from "../App";

const VARIABLE_REGEX = /{\w+\|\w*}/g;

const hasVariables = (content: string) => !!content.match(VARIABLE_REGEX);

const Variable = ({ value }: { value: string }) => {
  return <span className="variable">{value}</span>;
};

const Template = React.memo(
  ({ content, context = {} }: { content: string; context: any }) => {
    const matches = content.matchAll(VARIABLE_REGEX);
    const chunks = [];

    const push = (s: string) => s.length > 0 && chunks.push(s);

    let cursor = 0;

    for (const match of matches) {
      const { 0: variable, index = 0 } = match;

      // add string before the variable if not empty
      push(content.slice(cursor, index));

      // add variable component
      const [id, defaultValue] = variable
        // remove surrounding {}
        .slice(1, -1)
        .split("|");
      chunks.push(
        <Variable value={context[id]?.name || defaultValue} key={id} />
      );

      cursor = index + variable.length;
    }

    push(content.slice(cursor, content.length));

    return <p>{chunks}</p>;
  }
);

const Details = ({ node, variables }: { node: Node; variables: any }) => {
  const { title } = node;

  return (
    <div>
      <h2>{title}</h2>

      {(node.content || []).map((content, index) => {
        if (content.type === "text") {
          const cleanText = DOMPurify.sanitize(content.body);

          if (!cleanText) return null;

          return hasVariables(cleanText) ? (
            <Template content={cleanText} context={variables} key={index} />
          ) : (
            <p dangerouslySetInnerHTML={{ __html: cleanText }} key={index} />
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
