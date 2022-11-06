import React, { useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { contribute, withdrawSuccessfulFunds } from "../redux/interactions";
import { etherToWei } from "../helper/helper";
import { toastSuccess, toastError } from "../helper/toastMessage";
import { useRouter } from "next/router";

const colorMaker = (state) => {
  if (state === "Ongoing") {
    return "bg-amber-500";
  } else if (state === "Unsuccessful") {
    return "bg-red-500";
  } else {
    return "bg-emerald-500";
  }
};

const FundRiserCard = ({ props }) => {
  const [btnLoader, setBtnLoader] = useState(false);
  const [amount, setAmount] = useState(0);
  const dispatch = useDispatch();
  const crowdFundingContract = useSelector(
    (state) => state.fundingReducer.contract
  );
  const account = useSelector((state) => state.web3Reducer.account);
  const web3 = useSelector((state) => state.web3Reducer.connection);

  const router = useRouter();

  const contributeAmount = (projectId, minContribution) => {
    if (amount < minContribution) {
      toastError(`Minimum contribution amount is ${minContribution}`);
      return;
    }

    setBtnLoader(projectId);
    const contributionAmount = etherToWei(amount);

    const data = {
      contractAddress: projectId,
      amount: contributionAmount,
      account: account,
    };
    const onSuccess = () => {
      setBtnLoader(false);
      setAmount(0);
      // toastSuccess(`Successfully contributed ${amount} ETH`);
      router.reload(window.location.pathname);
    };
    const onError = (message) => {
      setBtnLoader(false);
      toastError(message);
    };
    contribute(crowdFundingContract, data, dispatch, onSuccess, onError);
  };

  const requestForWithdraw = (projectId) => {
    setBtnLoader(projectId);
    const contributionAmount = etherToWei(amount);

    const data = {
      description: `${amount} ETH requested for withdraw`,
      amount: contributionAmount,
      recipient: account,
      account: account,
    };
    const onSuccess = (data) => {
      setBtnLoader(false);
      setAmount(0);
      // toastSuccess(`Successfully requested for withdraw ${amount} ETH`);
      router.reload(window.location.pathname);
    };
    const onError = (message) => {
      setBtnLoader(false);
      toastError(message);
    };
    withdrawSuccessfulFunds(web3, projectId, data, onSuccess, onError);
  };

  return (
    <div className="card relative overflow-hidden mb-8">
      <div className={`ribbon ${colorMaker(props.state)} mx-5`}>
        {props.state}
      </div>
      <Link href={`/project-details/${props.address}`}>
        <h1 className="font-sans text-2xl text-gray-800 font-semibold hover:text-[#F7C984] hover:cursor-pointer w-fit mb-1">
          {props.title}
        </h1>
      </Link>
      <p className="font-sans text-md text-gray-500 font-medium tracking-tight">
        {props.description}
      </p>
      <div className="flex flex-col lg:flex-row inner-card my-6">
        <div className="my-2 w-full md:w-2/5 flex flex-col ">
          <div className="mb-3">
            <p className="text-md font-semibold font-sans text-gray-800">
              Target Amount
            </p>
            <p className="text-sm font-bold font-sans text-gray-600">
              {props.goalAmount} ETH{" "}
            </p>
          </div>
          <div>
            <p className="text-md font-semibold font-sans text-gray-800">
              Deadline
            </p>
            <p className="text-sm font-bold font-sans text-gray-600">
              {props.deadline}
            </p>
          </div>
        </div>
        <div className="my-2 w-full md:w-3/5">
          {props.creator !== account && props.state !== "Successful" ? (
            <>
              <label className="text-sm text-gray-800 font-semibold">
                Contribution Amount:
              </label>
              <div className="flex flex-row my-1">
                <input
                  type="number"
                  placeholder="Type here"
                  value={amount}
                  min="0"
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={btnLoader === props.address}
                  className="input rounded-l-md"
                />

                <button
                  className="button"
                  onClick={() =>
                    contributeAmount(props.address, props.minContribution)
                  }
                  disabled={btnLoader === props.address}
                >
                  {btnLoader === props.address ? "Loading..." : "Contribute"}
                </button>
              </div>
              <p className="text-sm text-red-600">
                {" "}
                <span className="font-bold">NOTE : </span> Minimum contribution
                is {props.minContribution} ETH{" "}
              </p>
            </>
          ) : (
            <>
              <div className="mb-3">
                <p className="text-md font-semibold font-sans text-gray-800">
                  Contract balance
                </p>
                <p className="text-sm font-bold font-sans text-gray-600">
                  {props.contractBalance} ETH{" "}
                </p>
              </div>

              {props.creator === account && props.contractBalance > 0 ? (
                <>
                  <label className="text-sm text-gray-700 font-semibold">
                    Withdraw Request:
                  </label>
                  <div className="flex flex-row my-1">
                    <input
                      type="number"
                      placeholder="Type here"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={btnLoader === props.address}
                      className="input rounded-l-md"
                    />
                    <button
                      className="button"
                      onClick={() => requestForWithdraw(props.address)}
                    >
                      {btnLoader === props.address ? "Loading..." : "Withdraw"}
                    </button>
                  </div>
                </>
              ) : (
                ""
              )}
            </>
          )}
        </div>
      </div>

      {props.state !== "Successful" ? (
        <div className="w-full bg-gray-200 rounded-full">
          <div className="progress" style={{ width: `${props.progress}%` }}>
            {" "}
            {props.progress}%{" "}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default FundRiserCard;
