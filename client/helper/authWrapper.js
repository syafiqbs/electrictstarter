import Router, { useRouter } from "next/router";
import Navbar from "../components/Navbar";

export const getLocalStorageData = (name) => {
  var value;
  if (typeof window !== "undefined") {
    value = localStorage.getItem(name);
  }
  return value;
};

const authWrapper = (WrappedComponent) => {
  // eslint-disable-next-line react/display-name
  return (props) => {
    //  if (typeof window !== "undefined") {
    //    const router = useRouter();

    //     const walletAddress = localStorage.getItem("ADDRESS");
    //     console.log(walletAddress)

    //   if (walletAddress) {
    return (
      <div className="flex flex-col" style={{ minHeight: "100vh" }}>
        <Navbar />
        <WrappedComponent {...props} />
      </div>
    );
    //   } else {
    //     router.replace("/");
    //     return  null;
    //   }
    // }

    // return <div>Window not found</div>
  };
};

export default authWrapper;
