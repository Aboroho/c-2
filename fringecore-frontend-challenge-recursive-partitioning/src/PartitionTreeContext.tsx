import { createContext, useContext, useState } from "react";
import { generateRandomId, getRandomColor } from "./utils";

/**
 * Structure of partition Node
 */
type PartitionTree = {
  id: string;
  color: string;
  size: number;
  dir: "v" | "h";
  children: Array<PartitionTree>;
};

type PartitionTreeContext = {
  partitionTree: PartitionTree;
  handleAddPartition: (parentId: string, dir: "h" | "v") => void;
  handleRemovePartition: (parentId: string, partitionId: string) => void;
  handleUpdatePartition: (partitionId: string, data: PartitionTree) => void;
  getCurrentPartition: (partitionId?: string) => PartitionTree;
};

const partitionTreeContext = createContext<PartitionTreeContext | null>(null);

export default function PartitionTreeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [partitionTree, setPartitionTree] = useState<PartitionTree>({
    color: getRandomColor(),
    size: 100,
    id: generateRandomId(),
    dir: "v",
    children: [],
  });

  /**
   * Finds and returns a partition with a given partitionId from the PartitionTree.
   *  If partitionId is not found, it returns the root partitionTree.
   */
  const getCurrentPartition = function (
    partitionId: string | undefined,
    curPartition: PartitionTree = partitionTree
  ): PartitionTree {
    if (!partitionId) return partitionTree;
    if (curPartition.id === partitionId) return curPartition;

    for (const child of curPartition.children) {
      const partition = getCurrentPartition(partitionId, child);
      if (partition && partition.id === partitionId) return partition;
    }
    return partitionTree;
  };

  /**
   * Adds a new partition as a child to the partitionTree with parentId.
   * It splits the parent into two children with a specified direction (dir), creating two new partitions.
   */
  const insertPartition = function (
    parentId: string,
    dir: "v" | "h",
    curPartition: PartitionTree = partitionTree
  ): PartitionTree {
    if (curPartition.id === parentId) {
      return {
        ...curPartition,
        dir,
        children: [
          {
            color: curPartition.color,
            size: 50,
            id: generateRandomId(),
            children: [],
            dir: "h",
          },
          {
            color: getRandomColor(),
            size: 50,
            children: [],
            id: generateRandomId(),
            dir: "h",
          },
        ],
      };
    }

    return {
      ...curPartition,
      children: curPartition.children.map((child) =>
        insertPartition(parentId, dir, child)
      ),
    };
  };

  const handleAddPartition = (parentId: string, dir: "h" | "v") => {
    const updatedPartition = insertPartition(parentId, dir);
    setPartitionTree(updatedPartition);
  };

  /**
   * Removes a child partition with the given partitionId from the parent partition (parentId).
   * If the parent has no other children, it remains unchanged.
   * If the parent has only one children, the parent will be replaced by the children. Only the size of the parent will remain unchanged
   */
  const removePartition = function (
    parentId: string,
    partitionId: string,
    curPartition: PartitionTree = partitionTree
  ): PartitionTree {
    if (parentId === curPartition.id) {
      const child = curPartition.children.find(
        (child) => child.id !== partitionId
      );

      if (!child) return curPartition;
      return { ...child, size: curPartition.size };
    }
    return {
      ...curPartition,
      children: curPartition.children.map((child) =>
        removePartition(parentId, partitionId, child)
      ),
    };
  };

  const handleRemovePartition = (
    parentId: string | undefined,
    partitionId: string
  ) => {
    if (!parentId) return;
    const updatedPartition = removePartition(parentId, partitionId);
    setPartitionTree(updatedPartition);
  };

  /**
   * Updates the properties of a specific partition identified by partitionId with the new data provided.
   * Recursively traverses the tree to find and update the partition.
   */
  const updatePartition = function (
    partitionId: string,
    data: PartitionTree,
    curPartition: PartitionTree = partitionTree
  ): PartitionTree {
    if (partitionId === curPartition.id) {
      return { ...curPartition, ...data };
    }
    return {
      ...curPartition,
      children: curPartition.children.map((child) =>
        updatePartition(partitionId, data, child)
      ),
    };
  };

  const handleUpdatePartition = (partitionId: string, data: PartitionTree) => {
    const updatedPartition = updatePartition(partitionId, data);
    setPartitionTree(updatedPartition);
  };

  return (
    <partitionTreeContext.Provider
      value={{
        getCurrentPartition,
        handleAddPartition,
        handleRemovePartition,
        handleUpdatePartition,
        partitionTree,
      }}
    >
      {children}
    </partitionTreeContext.Provider>
  );
}

export const usePartitionTreeContext = () => {
  const context = useContext(partitionTreeContext);

  if (!context)
    throw new Error(
      "`useLayoutContext` should be use inside `LayoutContextProvider`"
    );

  return context;
};
