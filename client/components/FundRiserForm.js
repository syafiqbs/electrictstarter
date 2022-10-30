import React, { useEffect, useState } from "react";
import moment from "moment";
import { startFundRaising } from "../redux/interactions";
import { useDispatch, useSelector } from "react-redux";
import { etherToWei } from "../helper/helper";
import { toastSuccess, toastError } from "../helper/toastMessage";

const FundRiserForm = () => {
  const crowdFundingContract = useSelector(
    (state) => state.fundingReducer.contract
  );
  const account = useSelector((state) => state.web3Reducer.account);
  const web3 = useSelector((state) => state.web3Reducer.connection);

  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetedContributionAmount, setTargetedContributionAmount] =
    useState("");
  const [minimumContributionAmount, setMinimumContributionAmount] =
    useState("");
  const [deadline, setDeadline] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const today = new Date();
  const currentDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  const raiseFund = (e) => {
    e.preventDefault();
    setBtnLoading(true);
    const unixDate = moment(deadline).valueOf();

    const onSuccess = () => {
      setBtnLoading(false);
      setTitle("");
      setDescription("");
      setTargetedContributionAmount("");
      setMinimumContributionAmount("");
      setDeadline("");
      setShowModal(false);
      toastSuccess("Fund rising started 🎉");
    };

    const onError = (error) => {
      setBtnLoading(false);
      toastError(error);
    };

    const data = {
      minimumContribution: etherToWei(minimumContributionAmount),
      deadline: Number(unixDate),
      targetContribution: etherToWei(targetedContributionAmount),
      projectTitle: title,
      projectDesc: description,
      account: account,
    };

    startFundRaising(
      web3,
      crowdFundingContract,
      data,
      onSuccess,
      onError,
      dispatch
    );
  };

  return (
    <>
      {/* Modal Toggle */}
      <button
        className="block text-white bg-[#ff758f] hover:bg-[#ff5c8a] font-medium rounded-md text-sm px-4 py-4 text-center fixed right-8 bottom-8"
        type="button"
        data-modal-toggle="defaultModal"
        onClick={() => setShowModal(true)}
      >
        Start a Fund Raiser
      </button>

      {/* Main Modal */}
      {showModal ? (
        <div
          id="defaultModal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed overflow-y-auto overflow-x-hidden top-0 left-0 right-0 z-50 w-full md:inset-0 h-modal md:h-full bg-gray-600 bg-opacity-50"
        >
          <div className="relative p-4 w-full max-w-2xl h-full md:h-full left-1/2 translate-x-[-50%] overflow-y-auto">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex justify-between items-start p-6 rounded-t border-b ">
                <h3 className="text-2xl font-semibold text-gray-900 ">
                  New Fund Raise
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                  data-modal-toggle="defaultModal"
                  onClick={() => setShowModal(false)}
                >
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto">
                <form onSubmit={(e) => raiseFund(e)}>
                  <div className="form-control mt-0 mb-4">
                    <label className="font-medium text-md text-gray-700">
                      Name:
                    </label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      className="form-control-input border-neutral-400 focus:ring-neutral-200"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-control my-4">
                    <label className="font-medium text-md text-gray-700">
                      Description:
                    </label>
                    <textarea
                      placeholder="Enter description"
                      className="form-control-input border-neutral-400 focus:ring-neutral-200"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="form-control my-4">
                    <label className="font-medium text-md text-gray-700">
                      Target amount:
                    </label>
                    <input
                      type="number"
                      placeholder="Enter target amount"
                      className="form-control-input border-neutral-400 focus:ring-neutral-200"
                      value={targetedContributionAmount}
                      onChange={(e) =>
                        setTargetedContributionAmount(e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="form-control my-4">
                    <label className="font-medium text-md text-gray-700">
                      Minimum contribution amount:
                    </label>
                    <input
                      type="number"
                      placeholder="Enter minimum contribution amount"
                      className="form-control-input border-neutral-400 focus:ring-neutral-200"
                      value={minimumContributionAmount}
                      onChange={(e) =>
                        setMinimumContributionAmount(e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="form-control date-picker my-4">
                    <label className="font-medium text-md text-gray-700">
                      Deadline:
                    </label>
                    <input
                      type="date"
                      placeholder="Select deadline"
                      className="form-control-input border-neutral-400 focus:ring-neutral-200"
                      value={deadline}
                      min={currentDate}
                      onChange={(e) => setDeadline(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    className="p-3 my-4 w-full font-medium text-md bg-[#ff758f] text-white rounded-md hover:bg-[#ff5c8a]"
                    disabled={btnLoading}
                  >
                    {btnLoading ? "Loading..." : "Raise fund"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default FundRiserForm;
