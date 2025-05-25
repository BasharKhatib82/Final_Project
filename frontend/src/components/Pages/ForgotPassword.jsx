import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

function ForgotPassword() {
  const nav = useNavigate();
  useEffect(() => {
    let un = localStorage.getItem("un");
    if (un !== null) {
      nav("/home");
    }
  }, [nav]);

  const rUn = useRef();
  const [un, setUn] = useState("");
  const [msg, setMsg] = useState("");

  
  return (
    <>
      <center>
        
        <div className="form-container">
          <h1> Forgot Password </h1>
          <form onSubmit={""}>
            <input
              type="email"
              placeholder="enter registered email"
              onChange={""}
              ref={rUn}
              value={un}
            />
            <br />
            <br />
            <input type="submit" value="Send Email" />
          </form>
          <h2> {msg} </h2>
        </div>
      </center>
      <Footer />
    </>
  );
}

export default ForgotPassword;
