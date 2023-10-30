import { addDoc, collection, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import EmojiPicker from "emoji-picker-react";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Form = styled.form`
  --green: #44d62c;
  --border: rgb(47, 51, 54);
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0px 50px;
  padding-left: 75px;
  border-bottom: 1px solid var(--border);
`;

const Profile = styled.img`
  position: absolute;
  left: -55px;
  top: 5px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

const TweetAlign = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 70px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
`;

const AlignButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  opacity: 0.5;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: bold;
  &:hover {
    background-color: var(--border);
  }
`;

const TextWrapper = styled.div`
  position: relative;
  svg {
    position: absolute;
    background-color: gray;
    left: -55px;
    top: 5px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  font-size: 20px;
  color: #e7e9ea;
  background-color: black;
  width: 100%;
  resize: none;
  border: none;
  outline: none;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &::placeholder {
    font-size: 20px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const OptionGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
  color: var(--green);
`;

const AttechFileButton = styled.label`
  padding: 10px 0px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 25px;
`;

const AttechFileInput = styled.input`
  display: none;
`;

const AttechEmoji = styled.div`
  cursor: pointer;
  width: 25px;
  position: relative;
`;

const EmojiButton = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  height: 300px;
  background-color: white;
  border: 1px solid black;
  z-index: 10;
  visibility: hidden;
`;

const SubmitBtn = styled.input`
  background-color: black;
  color: white;
  background-color: var(--green);
  opacity: 0.5;
  border: none;
  padding: 0px 15px;
  border-radius: 20px;
  font-size: 16px;
  min-width: 36px;
  min-height: 36px;
  cursor: pointer;
  font-weight: bold;
  &:hover,
  &:active {
    opacity: 0.8;
  }
`;

export default function PostTweetForm() {
  const user = auth.currentUser;
  const profile = user?.photoURL;
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [isRecoActive, setIsRecoActive] = useState(false);
  const [isFollowActive, setIsFollowActive] = useState(false);

  const onToggleAlignButton = (e: React.MouseEvent<HTMLDivElement>) => {
    const reco = document.getElementById("recoButton");
    const follow = document.getElementById("followButton");
    setIsActive(!isActive);
    (e.currentTarget as HTMLElement).style.opacity = isActive ? "1" : "0.5";
    (e.currentTarget as HTMLElement).style.borderBottom = isActive ? "5px solid #44d62c" : "";
    console.log(isActive);
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(e.target.value);
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
      if (e.target.value !== "") {
        submitBtn.style.opacity = "0.8";
      } else {
        submitBtn.style.opacity = "0.5";
      }
    }
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files && files.length === 1) {
      if (files[0].size > 1024 * 1024) {
        return window.alert("Please choose a file smaller than 1MB.");
      }
      setFile(files[0]);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const user = auth.currentUser;
    e.preventDefault();
    if (!user || isLoading || tweet === "" || tweet.length > 180) return;
    try {
      setLoading(true);
      const doc = await addDoc(collection(db, "tweets"), {
        tweet,
        createdAt: Date.now(),
        username: user.displayName || "Anonymous",
        userId: user.uid,
        email: user.email,
        profile: user.photoURL,
      });
      if (file) {
        const locationRef = ref(storage, `tweets/${user.uid}/${doc.id}`);
        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref);
        await updateDoc(doc, {
          photo: url,
        });
      }
      setTweet("");
      setFile(null);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <TweetAlign>
        <AlignButton onClick={onToggleAlignButton} id="recoButton">
          <span>추천</span>
        </AlignButton>
        <AlignButton onClick={onToggleAlignButton} id="followButton">
          <span>팔로우 중</span>
        </AlignButton>
      </TweetAlign>
      <Form onSubmit={onSubmit}>
        <TextWrapper>
          {profile ? (
            <Profile src={profile || ""} />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
          )}

          <TextArea
            required
            rows={1}
            maxLength={180}
            onChange={onChange}
            value={tweet}
            placeholder="무슨 일이 일어나고 있나요?"
          />
        </TextWrapper>
        <ButtonGroup>
          <OptionGroup>
            <AttechFileButton htmlFor="file">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </AttechFileButton>
            <AttechFileInput onChange={onFileChange} type="file" id="file" accept="image/*" />
            <AttechEmoji
              onClick={() => {
                if (emojiOpen) {
                  setEmojiOpen(false);
                } else {
                  setEmojiOpen(true);
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                />
              </svg>
              <EmojiButton style={{ visibility: emojiOpen ? "visible" : "hidden" }}>
                <EmojiPicker
                  onEmojiClick={(e) => {
                    setTweet(tweet + e.emoji);
                  }}
                />
              </EmojiButton>
            </AttechEmoji>
          </OptionGroup>

          <SubmitBtn type="submit" id="submitBtn" value="게시하기" />
        </ButtonGroup>
      </Form>
    </Wrapper>
  );
}
