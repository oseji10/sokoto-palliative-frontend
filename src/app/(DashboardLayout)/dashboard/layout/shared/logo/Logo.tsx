import Link from "next/link";
import { styled } from "@mui/material";
import Image from "next/image";

const LinkStyled = styled(Link)(() => ({
  height: "100px",
  width: "250px",
  overflow: "hidden",
  display: "block",
}));

const OurLogo = () => {
  return (
    <LinkStyled href="/">
      <Image 
        src="/images/logos/sokoto-palliative1.svg" 
        alt="logo" 
        width={250} 
        height={100} 
        priority 
      />
    </LinkStyled>
  );
};

export default OurLogo;
