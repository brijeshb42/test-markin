import { useState, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { Grid } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import examples from "./examples";
import SaveButton from "./components/SaveButton";
import DeployButton from "./components/DeployButton";
import FilenameInput from "./components/FilenameInput";

import "./App.css";

function App() {
  const editorRef = useRef(null);
  const modelRef = useRef(null);
  const [currentText, setCurrentText] = useState(examples["cheese"]);
  const [filename, setFilename] = useState("Your Filename");

  function handleSetFilename(newFilename) {
    setFilename(newFilename);
  }

  // function clearText() {
  //   alert('spotemgotem');
  // }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    modelRef.current = editor.getModel();

    // setup monaco-vim
    window.require.config({
      paths: {
        vs: "https://unpkg.com/monaco-editor/min/vs",
        "monaco-vim": "https://unpkg.com/monaco-vim/dist/monaco-vim",
      },
    });

    window.require(["monaco-vim"], function ({ initVimMode, VimMode }) {
      const statusNode = document.createElement("div");
      statusNode.style.display = "flex";
      statusNode.style.position = "fixed";
      statusNode.style.zIndex = "3";
      statusNode.style.bottom = "0";
      statusNode.style.left = "0";
      statusNode.style.color = "white";
      statusNode.style.background = "#2d2d30";
      statusNode.style.width = "100%";
      statusNode.style.fontSize = "13px";
      statusNode.style.fontWeight = "500";

      // BLOCKED: This doesn't work, reached out to developer for help
      // statusNode.addEventListener('change', function() {
      //   VimMode.Vim.defineEx('write', 'w', clearText);
      // });
      initVimMode(editorRef.current, statusNode);
      VimMode.Vim.defineEx("write", "w", function () {
        // your own implementation on what you want to do when :w is pressed
        console.log(editor);
        localStorage.setItem("editorvalue", editorRef.current.getValue());
      });

      document.body.appendChild(statusNode);
    });
  }

  const options = {
    renderWhitespace: "all",
    autoIndent: true,
    fontSize: 16,
    wordWrap: "on",
    minimap: {
      enabled: true,
      autohide: true,
    },
  };

  return (
    <>
      {/* top bar */}
      <Grid container paddingTop={1} spacing={2} direction="row-reverse">
        <Grid item>
          <SaveButton currentText={currentText} defaultFileName={filename} />
        </Grid>
        <Grid item>
          <DeployButton currentText={currentText} defaultFilename={filename} />
        </Grid>
        <Grid item>
          <FilenameInput
            onInputSubmit={handleSetFilename}
            defaultFilename={filename}
          />
        </Grid>
      </Grid>

      {/* main section */}
      <Grid container spacing={2} direction="row" alignItems={"center"}>
        {/* editor */}
        <Grid item md={6}>
          <div className="App">
            <Editor
              height="100vh"
              width="100%"
              theme="vs-dark"
              defaultValue={examples["cheese"]}
              defaultLanguage="markdown"
              onMount={handleEditorDidMount}
              onChange={() => {
                setCurrentText(editorRef.current.getValue());
              }}
              options={options}
            />
          </div>
        </Grid>

        {/* preview */}
        <Grid item md={6}>
          <div style={{ height: "100vh", overflow: "auto" }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              children={currentText}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      {...props}
                      children={String(children).replace(/\n$/, "")}
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                    />
                  ) : (
                    <code {...props} className={className}>
                      {children}
                    </code>
                  );
                },
              }}
            />
          </div>
        </Grid>
      </Grid>
    </>
  );
}

export default App;
