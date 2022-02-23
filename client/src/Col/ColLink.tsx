import { Box, SxProps } from "@mui/material";
import React from "react";
import { Col } from "../types/Col";
import useChangeCol from "./useChangeCol";

interface ColLinkProps {
  pathname: string;
  col: Col;
  sx?: SxProps;
  children: JSX.Element | string;
}
export default function ColLink(props: ColLinkProps) {
  const { changeCol } = useChangeCol();

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    changeCol(props.col, props.pathname);
  }
  return (
    <Box component='span' onClick={handleClick} sx={{
      ...props.sx,
      textDecoration: 'underline',
    }}>
      {props.children}
    </Box>
  )
}