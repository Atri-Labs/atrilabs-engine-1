import { useTree } from "@atrilabs/core";
import CssTreeId from "@atrilabs/app-design-forest/lib/cssTree?id";
import ComponentTreeId from "@atrilabs/app-design-forest/lib/componentTree?id";
// import { jssToCss } from "../../../../app-generator/src/react-app-template-manager/jssToCss";
import { getAncestors, getStylesAlias } from "@atrilabs/canvas-runtime-utils";
import {
  gray200,
  teal400,
  gray800,
  h5Heading,
  smallText,
  white,
} from "@atrilabs/design-system";
import React, { useState } from "react";
import { ReactComponent as DropDownArrow } from "../../assets/layout-parent/dropdown-icon.svg";
// CSS
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    paddingLeft: "0.5rem",
    paddingRight: "0.5rem",
    paddingTop: "1.2rem",
    paddingBottom: "1.8rem",
    borderBottom: `1px solid ${gray800}`,
    rowGap: "1.2rem",
  },
  header: {
    ...h5Heading,
    color: gray200,
    display: "flex",
    paddingLeft: "0.5rem",
    userSelect: "none",
  },
  drop: {
    display: "flex",
    alignItems: "baseline",
    cursor: "pointer",
  },
  cssContainer: {
    ...smallText,
    fontWeight: 400,
    marginBottom: ".25rem",
  },
  cssParentAlias: {
    ...smallText,
    color: white,
  },
  cssProperty: {
    color: teal400,
  },
  cssValues: {
    color: white,
    marginRight: ".25rem",
  },
};
const CssOfElement: React.FC<CssOfElementProp> = ({ compId, showAlias }) => {
  const cssTree = useTree(CssTreeId);
  const tree = useTree(ComponentTreeId);
  const { alias, cssStyles } = getStylesAlias(compId, tree, cssTree);
  const css = Object.keys(cssStyles).map((ele, index) => {
    return (
      <div key={index + ele} style={styles.cssContainer}>
        <span style={styles.cssProperty}>{ele}: </span>
        <span style={styles.cssValues}>{cssStyles[ele]}</span>
      </div>
    );
  });
  return (
    <div>
      {showAlias && (
        <h3 style={styles.cssParentAlias}>Inherited from {alias}</h3>
      )}
      {css}
    </div>
  );
};
export const CssSummary: React.FC<CssSummaryProp> = ({ compId }) => {
  const [showProperties, setShowProperties] = useState<boolean>(false);
  const ancestorsId = getAncestors(compId);
  const CssSummary = ancestorsId.map((ele, index) => {
    return (
      <CssOfElement
        key={ele}
        compId={ele}
        // show alias of only of the parents
        showAlias={index >= 1 ? true : false}
      />
    );
  });
  return (
    <div style={styles.container}>
      <div style={styles.drop}>
        <DropDownArrow
          onClick={() => setShowProperties(!showProperties)}
          style={
            !showProperties
              ? { transform: "rotate(-90deg)" }
              : { transform: "rotate(0deg)" }
          }
        />
        <div style={styles.header}>Applied CSS</div>
      </div>
      <div
        style={
          showProperties
            ? { display: "flex", rowGap: "1rem", flexDirection: "column" }
            : { display: "none" }
        }
      >
        {CssSummary}
      </div>
    </div>
  );
};

interface CssSummaryProp {
  compId: string;
}
interface CssOfElementProp {
  compId: string;
  showAlias: boolean;
}
