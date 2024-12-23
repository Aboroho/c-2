import { useCallback, useRef, useState } from "react";
import { getFormatedLabel } from "./utils";
import { usePartitionTreeContext } from "./PartitionTreeContext";

type Props = {
  parentId?: string;
  partitionId?: string;
};

function Partition({ partitionId, parentId }: Props) {
  const {
    getCurrentPartition,
    handleAddPartition,
    handleRemovePartition,
    handleUpdatePartition,
  } = usePartitionTreeContext();
  const partition = getCurrentPartition(partitionId);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  function handleAddSection(dir: "h" | "v") {
    handleAddPartition(partition.id, dir);
  }

  const handleResize = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      let partitionSizeInPercent;
      let dragSize; // height or width of the current container.

      if (partition.dir === "h") {
        const mouseYRelativeToCurrentPartition = clientY - containerRect.top;
        partitionSizeInPercent =
          (mouseYRelativeToCurrentPartition / containerRect.height) * 100;
        dragSize = containerRect.height;
      } else {
        const mouseXRelativeToCurrentPartition = clientX - containerRect.left;
        partitionSizeInPercent =
          (mouseXRelativeToCurrentPartition / containerRect.width) * 100;
        dragSize = containerRect.width;
      }

      //   handle snapping
      const snapRadiusInPx = 10;
      const snapRadiusInPercent = (100 / dragSize) * snapRadiusInPx;

      // snap at 1/2
      if (Math.abs(partitionSizeInPercent - 50) <= snapRadiusInPercent)
        partitionSizeInPercent = 50;
      // snap at 1/4
      if (Math.abs(partitionSizeInPercent - 100 / 4) <= snapRadiusInPercent)
        partitionSizeInPercent = 100 / 4;
      // snap at 3/4
      if (Math.abs(partitionSizeInPercent - 300 / 4) <= snapRadiusInPercent)
        partitionSizeInPercent = 300 / 4;

      // resize between 5% and 95%
      partitionSizeInPercent = Math.max(
        5,
        Math.min(95, partitionSizeInPercent)
      );

      if (partition.children.length !== 2) return;

      const updatedPartition = {
        ...partition,
        children: [
          { ...partition.children[0], size: partitionSizeInPercent },
          { ...partition.children[1], size: 100 - partitionSizeInPercent },
        ],
      };

      handleUpdatePartition(partition.id, updatedPartition);
    },
    [handleUpdatePartition, partition]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();
      setIsMouseDown(true);
      const mouseMoveHandler = (moveEvent: MouseEvent) => {
        handleResize(moveEvent.clientX, moveEvent.clientY);
      };

      const mouseUpHandler = () => {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
        setIsMouseDown(false);
      };

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    },
    [handleResize]
  );

  function renderActionButton() {
    return (
      <div className="flex gap-[1px] flex-wrap">
        <button
          onClick={() => handleAddSection("v")}
          className="px-4 py-2 bg-blue-700 text-white font-medium text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 "
        >
          v
        </button>
        <button
          onClick={() => handleAddSection("h")}
          className="px-4 py-2 bg-blue-700 text-white font-medium text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 "
        >
          h
        </button>
        {parentId && (
          <button
            onClick={() => {
              handleRemovePartition(parentId, partition.id);
            }}
            className="px-4 py-2 bg-blue-700 text-white font-medium text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 "
          >
            -
          </button>
        )}
      </div>
    );
  }

  function renderSinglePartition(color: string) {
    return (
      <div
        className={`flex-1 flex justify-center items-center overflow-hidden`}
        style={{ background: color }}
      >
        {renderActionButton()}
      </div>
    );
  }

  const isHorizontal = partition.dir === "h";
  const dirClass = partition.dir === "v" ? "flex-row" : "flex-col";
  return (
    <div
      className={`w-full h-full flex ${dirClass} relative`}
      ref={containerRef}
    >
      {partition.children.length === 0
        ? renderSinglePartition(partition.color)
        : partition.children.map((child) => (
            <div
              key={child.id}
              style={{ flexBasis: `${child.size}%` }}
              className="flex-1 overflow-hidden"
            >
              <Partition parentId={partition.id} partitionId={child.id} />
            </div>
          ))}

      {/* resizer */}
      {partition.children.length > 1 && (
        <div
          onMouseDown={handleMouseDown}
          style={{
            [isHorizontal ? "width" : "height"]: "100%",
            [isHorizontal ? "height" : "width"]: "5px",
            [isHorizontal ? "top" : "left"]: `${partition.children[0].size}%`,
            cursor: isHorizontal ? "row-resize" : "col-resize",
          }}
          className={`bg-black absolute  z-10 flex items-center ${
            isHorizontal ? "flex-col" : "flex-row"
          } ${isMouseDown && "bg-orange-700 ring-2 ring-white"}`}
        >
          {isMouseDown && (
            <div className="bg-black text-white">
              {getFormatedLabel(partition.children[0].size)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Partition;
