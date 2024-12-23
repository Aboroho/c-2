import PartitionTreeContextProvider from "./PartitionTreeContext";
import Partition from "./Partition";

const App = () => {
  return (
    <div className="h-screen w-screen">
      <PartitionTreeContextProvider>
        <Partition />
      </PartitionTreeContextProvider>
    </div>
  );
};

export default App;
