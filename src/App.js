import React, { useState, useCallback, useEffect } from "react";
import GitHubButton from "react-github-btn";
import styled from "styled-components";
import RotateWasm from "./RotateWasm";

function App() {
  const [bitMapArr, setBitMapArr] = useState([]);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [canvas, setCanvas] = useState(null);
  const [pointer, setPointer] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [module, setModule] = useState(null);

  useEffect(() => {
    async function fn() {
      if (width > 0 && height > 0) {
        const response = await fetch("wasm_image_editor_bg.wasm");
        const bytes = await response.arrayBuffer();
        const results = await WebAssembly.instantiate(bytes, {
          env: { cos: Math.cos },
        });

        const module = {};
        const mod = await results.instance;
        module.update = mod.exports.update;
        module.alloc = mod.exports.alloc;
        module.dealloc = mod.exports.dealloc;
        module.rotate_180 = mod.exports.rotate_180;

        const pnt = module.alloc(width * height * 4);

        setPointer(pnt);
        setBuffer(mod.exports.memory.buffer);
        setModule(module);
      }
    }
    fn();
  }, [width, height]);

  return (
    <AppContainer>
      <Title>Simple Squoosh</Title>
      <GitHubButtonWrapper>
        <GitHubButton
          href="https://github.com/hosseind88/SimpleSquoosh"
          data-size="large"
          aria-label="Star hosseind88/SimpleSquoosh on GitHub"
        >
          Star
        </GitHubButton>
      </GitHubButtonWrapper>
      <ImagePicker
        onConvertImage={({ bitMapArr, width, height }) => {
          setBitMapArr(bitMapArr);
          setWidth(width);
          setHeight(height);
        }}
        setCanvas={setCanvas}
        canvas={canvas}
        bitMapArr={bitMapArr}
      />
      <Buttons show={isImageSelected(bitMapArr)}>
        <RotateWasm
          bitMapArr={bitMapArr}
          width={width}
          height={height}
          canvas={canvas}
          pointer={pointer}
          buffer={buffer}
          module={module}
        />
      </Buttons>
    </AppContainer>
  );
}

function isImageSelected(bma) {
  return bma.length > 0;
}

function ImagePicker({ onConvertImage, canvas, setCanvas, bitMapArr }) {
  const onPickImage = (e) => {
    const context = canvas.getContext("2d");
    const image = new Image();
    image.src = window.URL.createObjectURL(e.target.files[0]);
    image.onload = () => {
      canvas.height = image.height;
      canvas.width = image.width;
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;

      onConvertImage({
        bitMapArr: imageData,
        width: canvas.width,
        height: canvas.height,
      });
    };
  };

  const doRef = useCallback((canvas) => {
    setCanvas(canvas);
  }, []);

  return (
    <ImagePickerContainer>
      <input
        type="file"
        accept="image/*"
        onChange={onPickImage}
        style={{
          display: !isImageSelected(bitMapArr) ? "block" : "none",
        }}
      ></input>
      <HiddenCanvas ref={doRef} show={isImageSelected(bitMapArr)} />
    </ImagePickerContainer>
  );
}

const Buttons = styled.div`
  display: flex
  opacity: ${(props) => (props.show ? 1 : 0.1)}
  pointer-events: ${(props) => (props.show ? "initial" : "none")}
  flex: 1
  flex-wrap: wrap
  & > *{
    margin: 0 1em
  }
    
`;

const AppContainer = styled.div`
  min-height: 100vh
  display: flex
  flex-direction: column
  align-items: center
`;

const Title = styled.h1`
  font-weight: 700
  margin: 10px 16px
`;

const GitHubButtonWrapper = styled.div`
  position: fixed;
  left: 2%;
  top: 10px;
`;

const ImagePickerContainer = styled.div`
  width: 95%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  border: 4px dashed gray;
`;

const HiddenCanvas = styled.canvas`
  display: ${(props) => (props.show ? "block" : "none")};
`;

export default App;
