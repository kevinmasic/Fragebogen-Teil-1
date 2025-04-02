import React from "react";
import { eu, nrw } from "../assets";
//Foerderungs Logos
const Foerderung = () => {
  return (
    <div className="fixed top-[0%] right-[2%] flex 2xl:flex-row flex-col justify-evenly items-center align-middle">
      <div className="p-3 mt-5 bg-white shadow-xl ">
        <img className="" src={eu} alt="Kofinanziert durch die EU" />
      </div>

      <div className="p-3 mt-5 bg-white shadow-xl">
        <img src={nrw} alt="Ministerium NRW" />
      </div>
    </div>
  );
};

export default Foerderung;
