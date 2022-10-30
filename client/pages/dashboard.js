import React from "react";
import authWrapper from "../helper/authWrapper";
import FundRiserForm from "../components/FundRiserForm";
import { useSelector } from "react-redux";
import FundRiserCard from "../components/FundRiserCard";
import Loader from "../components/Loader";

const Dashboard = () => {
  const projectsList = useSelector((state) => state.projectReducer.projects);

  return (
    <div className="px-2 py-4 flex flex-col lg:px-12 lg:flex-row h-full grow">
      <div className="lg:w-12/12 my-2 lg:my-0 lg:mx-0 w-full">
        {projectsList !== undefined ? (
          projectsList.length > 0 ? (
            projectsList.map((data, i) => (
              <FundRiserCard props={data} key={i} />
            ))
          ) : (
            <h1 className="text-3xl font-bold text-gray-500 text-center font-sans">
              No project found!
            </h1>
          )
        ) : (
          <Loader />
        )}
      </div>
      <FundRiserForm />
    </div>
  );
};

export default authWrapper(Dashboard);
