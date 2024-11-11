"use client";

import { client } from "@/helpers/story";
import { useState } from "react";
import { pinata } from "@/utils/config"

import { toHex } from "viem";

const Home = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAnimation, setSelectedAnimation] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target?.files?.[0]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Display the uploaded image preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAnimationSelect = (animation: number) => {
    setSelectedAnimation(animation);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please upload an image");
      return;
    }
    if (selectedAnimation === null) {
      alert("Please choose your video");
      return;
    }
    if (selectedFile && selectedAnimation !== null) {
      setLoading(true);
      setVideoUrl(null); // Reset video URL when a new submission is made
      try {
          const upload = await pinata.upload.file(selectedFile)
          console.log(upload);
        } catch (error) {
          console.log(error);
      }
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("number", selectedAnimation.toString());

      const response = await fetch("https://test-upload-video.onrender.com/uploadImage", {
        method: "POST",
        body: formData,
      });

      // upload to story
      const testUpload = await client.ipAsset.register({
        nftContract: "0x041B4F29183317Fd352AE57e331154b73F8a1D73", // your NFT contract address
        tokenId: "12", // your NFT token ID
        // https://docs.story.foundation/docs/ip-asset#adding-nft--ip-metadata-to-ip-asset
        ipMetadata: {
          ipMetadataURI: "test-uri",
          ipMetadataHash: toHex("test-metadata-hash", { size: 32 }),
          nftMetadataHash: toHex("test-nft-metadata-hash", { size: 32 }),
          nftMetadataURI: "test-nft-uri",
        },
        txOptions: { waitForTransaction: true },
      });

      setLoading(false);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setVideoUrl(url);
      }
    }
  };

  const handleAgain = () => {
    setSelectedFile(null);
    setSelectedAnimation(null);
    setVideoUrl(null);
    setPreviewUrl(null); // Reset preview URL
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {loading && (
        <div className="flex items-center justify-center">
          <div className="loader"></div>
          <p>Loading...</p>
        </div>
      )}
      {!loading && !videoUrl && (
        <>
          <h1 className="text-4xl font-bold mb-8">
            Let's Generate Your Special Video
          </h1>
          <div className="mb-4">
            <h2>Upload your image</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-4 border p-2 rounded"
            />
          </div>
          {previewUrl && (
            <div className="mb-4">
              <img
                src={previewUrl}
                alt="Uploaded"
                className="w-64 h-64 object-cover"
              />
            </div>
          )}
          <div className="mb-4">
            <h2>Select your video</h2>
          </div>
          <div className="flex mb-4">
            {[1, 2, 3].map((animation) => (
              <div key={animation} className="flex flex-col items-center mr-4">
                <video
                  src={`./${animation}.mp4`}
                  width="400"
                  height="200"
                  controls
                  className={`border-4 ${
                    selectedAnimation === animation
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                  onClick={() => handleAnimationSelect(animation)}
                />
                <button
                  onClick={() => handleAnimationSelect(animation)}
                  className={`mt-2 px-4 py-2 ${
                    selectedAnimation === animation
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-black"
                  } rounded`}
                >
                  Select Animation {animation}
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Submit
          </button>
        </>
      )}
      {videoUrl && (
        <div className="mt-4">
          <video controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <button
            onClick={handleAgain}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
