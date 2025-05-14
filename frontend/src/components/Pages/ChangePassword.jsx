import { useState, useRef, useEffect } from "react";

import { useNavigate } from "react-router-dom";

function ChangePassword() {
  const nav = useNavigate();

  useEffect(() => {
    let un = localStorage.getItem("un");
    if (un === null) {
      nav("/");
    }
  }, [nav]);

  const rPw1 = useRef();
  const rPw2 = useRef();

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");

  const hPw1 = (event) => {
    setPw1(event.target.value);
  };
  const hPw2 = (event) => {
    setPw2(event.target.value);
  };

  return (
    <>
      <center>
        <div className="form-container">
          <h1> Change Password </h1>
          <form onSubmit={""}>
            <input
              type="password"
              placeholder="Enter new Password"
              onChange={""}
              ref={""}
              value={""}
            />
            <br />
            <br />
            <input
              type="password"
              placeholder="Confirm New Password"
              onChange={""}
              ref={""}
              value={""}
            />
            <br />
            <br />
            <input type="submit" value="Change Password" />
          </form>
          <h2> {""} </h2>
        </div>
      </center>
    </>
  );
}

export default ChangePassword;
