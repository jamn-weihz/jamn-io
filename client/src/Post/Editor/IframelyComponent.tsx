import { useReactiveVar } from "@apollo/client";
import { Box } from "@mui/material";
import React, {useEffect, useState} from "react";
import { paletteVar, sizeVar } from "../../cache";
import { IFRAMELY_API_KEY_DARK, IFRAMELY_API_KEY_LIGHT } from "../../constants";
import { getColWidth } from "../../utils";
export interface IframelyComponentProps {
  url: string
};

export default function IframelyComponent(props: any) {
  const [error, setError] = useState(null as any);
  const [isLoaded, setIsLoaded] = useState(false);
  const [html, setHtml] = useState({
    __html: "<div />"
  });
  const paletteDetail = useReactiveVar(paletteVar);
  const sizeDetail = useReactiveVar(sizeVar);


  const key = paletteDetail.mode === 'dark'
    ? IFRAMELY_API_KEY_DARK
    : IFRAMELY_API_KEY_LIGHT;

  useEffect(() => {
    if (props.blockProps && props.blockProps.url) {
      fetch(`https://cdn.iframe.ly/api/iframely?url=${encodeURIComponent(props.blockProps.url)}&key=${key}&iframe=1&omit_script=1`)
        .then(res => res.json())
        .then(
          (res) => {
            setIsLoaded(true);
            if (res.html) {
              console.log(res.html)
              setHtml({__html: res.html});
            } else if (res.error) {
              setError({code: res.error, message: res.message});
            }
          },
          (error) => {
            setIsLoaded(true);
            setError(error);
          }
        )
    } else {
      setError({code: 400, message: 'Provide url attribute for the element'})
    }
  }, []);

  useEffect(() => {
    (window as any).iframely && (window as any).iframely.load();
  });

  if (error) {
    return <div>Error: {error.code} - {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <Box sx={{
        width: '100%'
      }} dangerouslySetInnerHTML = {
        html
      }/> 
    );
  }
}
