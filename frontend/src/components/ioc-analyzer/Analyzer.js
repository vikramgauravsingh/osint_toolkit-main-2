import React, { useState, useRef } from "react";
import SparkMD5 from "spark-md5";
import Alert from "@mui/material/Alert";
import { AlertTitle } from "@mui/material";
import Grow from "@mui/material/Grow";
import ResultTable from "./ResultTable";
import Introduction from "../Introduction";
import SearchBar from "../styled/SearchBar";

export default function Analyzer() {
  const [searchKey, setSearchKey] = useState("");
  const [iocType, setIocType] = useState(" ");
  const [invalidInput, setInvalidInput] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  const regexMap = [
    {
      type: "IPv4",
      regex:
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    },
    {
      type: "IPv6",
      regex:
        /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/,
    },
    { type: "MD5", regex: /^[a-f0-9]{32}$/ },
    { type: "SHA1", regex: /^[a-f0-9]{40}$/ },
    { type: "SHA256", regex: /^[a-f0-9]{64}$/ },
    {
      type: "Domain",
      regex:
        /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/,
    },
    {
      type: "URL",
      regex:
        /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/,
    },
    {
      type: "Email",
      regex:
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    },
    { type: "CVE", regex: /^CVE-[0-9]{4}-[0-9]{4,}$/ },
  ];

  const validateIoc = (ioc) => {
    const trimmedIoc = ioc.trim();
    for (const { type, regex } of regexMap) {
      if (regex.test(trimmedIoc)) {
        setInvalidInput(false);
        setSearchKey(trimmedIoc);
        setIocType(type);
        setShowTable(true);
        return true;
      }
    }
    setShowTable(false);
    setInvalidInput(true);
    return false;
  };

  const validateIocFromInput = () => {
    const inputValue = inputRef.current?.value.trim() || "";
    if (!validateIoc(inputValue)) {
      inputRef.current.value = "";
    }
  };

  const handleKeypress = (event) => {
    if (event.key === "Enter") {
      validateIocFromInput();
    }
  };

  const handleFilePick = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    // Privacy-friendly hashing in browser
    const buffer = await file.arrayBuffer();
    const md5 = SparkMD5.ArrayBuffer.hash(buffer);
    // Also compute SHA-1 and SHA-256 using SubtleCrypto
    const sha1Buf = await crypto.subtle.digest("SHA-1", buffer);
    const sha256Buf = await crypto.subtle.digest("SHA-256", buffer);
    const toHex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    const sha1 = toHex(sha1Buf);
    const sha256 = toHex(sha256Buf);
    // Prefer SHA256, then SHA1, then MD5
    const preferred = sha256;
    inputRef.current.value = preferred;
    validateIocFromInput();
  };

  return (
    <>
      <br />
      <SearchBar
        ref={inputRef}
        placeholder="Please enter an IOC..."
        buttonLabel="Analyze"
        onKeyDown={handleKeypress}
        onSearchClick={validateIocFromInput}
        sx={{ fontSize: '8px' }}
        size="small"
      />
      <br />
      <input
        type="file"
        ref={fileRef}
        onChange={handleFilePick}
        style={{ marginTop: 8 }}
      />
      <br />
      <br />
      {invalidInput && (
        <Grow in={true}>
          <Alert
            severity="error"
            variant="filled"
            onClose={() => setInvalidInput(false)}
            sx={{ borderRadius: 5 }}
          >
            <AlertTitle>
              <b>Error</b>
            </AlertTitle>
            Please enter a supported IOC (IP, Domain, URL, Email, MD5, SHA1,
            SHA256)
          </Alert>
        </Grow>
      )}
      {showTable ? (
        <ResultTable
          searchKey={searchKey}
          ioc={inputRef.current?.value || ""}
          iocType={iocType}
        />
      ) : (
        <Introduction moduleName="IOC Analyzer" centerText={true} />
      )}
    </>
  );
}
