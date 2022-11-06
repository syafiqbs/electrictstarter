import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FundRiserCard from "../../components/FundRiserCard";
import Loader from "../../components/Loader";
import authWrapper from "../../helper/authWrapper";
import { getContributors } from "../../redux/interactions";

const ProjectDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const web3 = useSelector((state) => state.web3Reducer.connection);
  const projectsList = useSelector((state) => state.projectReducer.projects);
  const filteredProject = projectsList?.filter((data) => data.address === id);

  const [contributors, setContributors] = useState(null);

  useEffect(() => {
    if (id) {
      const onSuccess = (data) => {
        setContributors(data);
      };
      const onError = (error) => {
        console.log(error);
      };

      getContributors(web3, id, onSuccess, onError);
    }
  }, [id]);

  return (
    <div className="px-2 py-4 flex flex-col lg:px-12 lg:flex-row ">
      <div className="lg:w-7/12 lg:my-0 lg:mx-0">
        {filteredProject ? (
          <FundRiserCard props={filteredProject[0]} />
        ) : (
          <Loader />
        )}
      </div>
      <div className="ml-6 card lg:w-5/12 h-screen overflow-y-hidden hover:overflow-y-auto">
        <h1 className="font-sans font-semibold text-2xl mb-4 gray-800">
          All contributors
        </h1>
        {contributors ? (
          contributors.length > 0 ? (
            contributors.map((data, i) => (
              <div className="inner-card my-2 flex flex-row" key={i}>
                <div className="lg:w-5/5 flex">
                  <div className="p-6 w-8 h-8 mx-auto my-auto rounded-md bg-slate-300"></div>
                  <div className="ml-3">
                    <p className="text-md font-semibold text-gray-800 w-80 truncate ">
                      {data.contributor}
                    </p>
                    <p className="text-sm font-bold text-gray-500">
                      {data.amount} ETH
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="font-semibold text-gray-500">
              Contributors not found
            </p>
          )
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
};

export default authWrapper(ProjectDetails);
