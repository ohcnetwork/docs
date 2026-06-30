import React, { useState, useEffect } from "react";
import forge from "node-forge";

export default function JwksGenerator() {
  const [jwks, setJwks] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [generateSuccess, setGenerateSuccess] = useState("");

  const generateKeys = () => {
    const rsa = forge.pki.rsa;
    const keypair = rsa.generateKeyPair({ bits: 2048 });

    const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
    const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);

    const privateKeyDer = forge.util.encode64(
      forge.asn1
        .toDer(forge.pki.privateKeyToAsn1(keypair.privateKey))
        .getBytes(),
    );

    const privateJwk = {
      kty: "RSA",
      d: privateKeyDer,
      alg: "RS256",
    };

    const jwks = {
      keys: [privateJwk],
    };

    return {
      jwks: jwks,
      jwksBase64: btoa(JSON.stringify(jwks)),
      privateKeyPem,
      publicKeyPem,
    };
  };

  const getJwksFromStorage = () => {
    const storedJwks = localStorage.getItem("jwks");
    if (storedJwks) {
      return JSON.parse(atob(storedJwks));
    } else {
      const generatedKeys = generateKeys();
      localStorage.setItem("jwks", btoa(JSON.stringify(generatedKeys.jwks)));
      return generatedKeys.jwks;
    }
  };

  const copyToClipboard = () => {
    if (jwks && jwks.keys && jwks.keys[0] && jwks.keys[0].d) {
      navigator.clipboard.writeText(jwks.keys[0].d).then(() => {
        setCopySuccess("JWKS copied to clipboard!");
        setTimeout(() => setCopySuccess(""), 2000);
      });
    }
  };

  const resetJwks = () => {
    setIsGenerating(true);
    setGenerateSuccess("Generating new JWKS...");
    setTimeout(() => {
      const generatedKeys = generateKeys();
      localStorage.setItem("jwks", btoa(JSON.stringify(generatedKeys.jwks)));
      setJwks(generatedKeys.jwks);
      setIsGenerating(false);
      setGenerateSuccess("New JWKS generated!");
      setTimeout(() => setGenerateSuccess(""), 2000);
    }, 1000);
  };

  useEffect(() => {
    const storedJwks = getJwksFromStorage();
    setJwks(storedJwks);
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {jwks ? (
        <div>
          <button
            onClick={copyToClipboard}
            style={{
              margin: "10px",
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Copy JWKS to Clipboard
          </button>
          {copySuccess && (
            <div
              style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                backgroundColor: "green",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                zIndex: 1000,
              }}
            >
              {copySuccess}
            </div>
          )}
          <button
            onClick={resetJwks}
            disabled={isGenerating}
            style={{
              margin: "10px",
              padding: "10px 20px",
              backgroundColor: isGenerating ? "#ccc" : "#008CBA",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: isGenerating ? "not-allowed" : "pointer",
            }}
          >
            {isGenerating ? "Generating..." : "Generate New JWKS"}
          </button>
          {generateSuccess && (
            <div
              style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                backgroundColor: "green",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                zIndex: 1000,
              }}
            >
              {generateSuccess}
            </div>
          )}
        </div>
      ) : (
        <p>Generating JWKS...</p>
      )}
    </div>
  );
}
