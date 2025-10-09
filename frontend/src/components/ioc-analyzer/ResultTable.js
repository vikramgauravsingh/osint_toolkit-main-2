import React from 'react';
import Button from '@mui/material/Button';

import Cve from './Cve';
import Domain from './Domain';
import Email from './Email';
import Hash from './Hash';
import Ipv4 from './Ipv4';
import Ipv6 from './Ipv6';
import Url from './Url';


function download(filename, text) {
  const element = document.createElement('a');
  const file = new Blob([text], { type: 'application/json' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function ResultTable(props) {
  const exportJson = () => {
    const payload = {
      ioc: props.ioc,
      type: props.iocType,
      timestamp: new Date().toISOString(),
    };
    download(`analysis-${props.ioc}.json`, JSON.stringify(payload, null, 2));
  };
  if (props.iocType === 'IPv4') {
    return (
      <>
        <Button variant="outlined" size="small" onClick={exportJson} style={{ float: 'right' }}>Export JSON</Button>
        <Ipv4 ioc={props.ioc} />
      </>
    )
  } else if (props.iocType === 'IPv6') {
    return (
      <>
        <Button variant="outlined" size="small" onClick={exportJson} style={{ float: 'right' }}>Export JSON</Button>
        <Ipv6 ioc={props.ioc} />
      </>
    )
  } else if (props.iocType === 'MD5') {
    return (
      <>
        <Button variant="outlined" size="small" onClick={exportJson} style={{ float: 'right' }}>Export JSON</Button>
        <Hash ioc={props.ioc} />
      </>
    )
  } else if (props.iocType === 'SHA1') {
    return (
      <>
        <Button variant="outlined" size="small" onClick={exportJson} style={{ float: 'right' }}>Export JSON</Button>
        <Hash ioc={props.ioc} />
      </>
    )
  } else if (props.iocType === 'SHA256') {
    return (
      <>
        <Button variant="outlined" size="small" onClick={exportJson} style={{ float: 'right' }}>Export JSON</Button>
        <Hash ioc={props.ioc} />
      </>
    )
  } else if (props.iocType === 'Domain') {
    return (
      <>
        <Button variant="outlined" size="small" onClick={exportJson} style={{ float: 'right' }}>Export JSON</Button>
        <Domain ioc={props.ioc} />
      </>
    )
  } else if (props.iocType === 'URL') {
    return (
      <>
        <Button variant="outlined" size="small" onClick={exportJson} style={{ float: 'right' }}>Export JSON</Button>
        <Url ioc={props.ioc} />
      </>
    )
  } else if (props.iocType === 'Email') {
    return (
      <>
        <Button variant="outlined" size="small" onClick={exportJson} style={{ float: 'right' }}>Export JSON</Button>
        <Email ioc={props.ioc} />
      </>
    )
  } else if (props.iocType === 'CVE') {
    return (
      <>
        <Button variant="outlined" size="small" onClick={exportJson} style={{ float: 'right' }}>Export JSON</Button>
        <Cve ioc={props.ioc} />
      </>
    )
  }
}

export default ResultTable