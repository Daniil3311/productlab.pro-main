import axios from "axios";
import { useEffect, useState } from "react";
import Lottie from "react-lottie";

const LottieComponent = ({animationUrl}) => {
  const [lottieOptions, setLottieOptions] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(
        `${process.env.BASE_URL}${animationUrl}`
      );
      setLottieOptions({
        loop: true,
        autoplay: true,
        animationData: response.data,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
        },
      });
    }
    fetchData();
  }, []);
  
  return (
    <div>
      {lottieOptions && <Lottie options={lottieOptions} />}
    </div>
  )
}

export default LottieComponent