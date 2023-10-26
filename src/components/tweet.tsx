import styled from "styled-components";
import { ITweet } from "../components/timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";

const Wrapper = styled.div`
  --border: rgb(47, 51, 54);
  --green: #44d62c;
  padding: 20px;
  border-top: 1px solid var(--border);
  padding-left: 85px;
  position: relative;
  color: #e7e9ea;
  > svg {
    position: absolute;
    background-color: gray;
    left: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const Column = styled.div``;

const Profile = styled.img`
  position: absolute;
  left: 20px;
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 50%;
`;

const Photo = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 15px;
  border: 1px solid rgb(47, 51, 54);
  margin-top: 20px;
  margin-bottom: 20px;
  object-fit: cover;
`;

const Username = styled.span`
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 20px;
  position: relative;
  svg {
    width: 20px;
    border-radius: 50%;
    cursor: pointer;
  }

  > svg {
    color: rgb(113, 118, 123);
    &:hover {
      color: var(--green);
      background-color: rgb(68, 214, 44, 0.2);
    }
  }
`;

const TweetModalContainer = styled.div`
  width: 120px;
  height: 80px;
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  background-color: black;
  border: 1px solid rgba(255, 255, 255, 0.3);
  gap: 10px;
  padding: 15px;
  font-size: 15px;
  color: white;
  font-weight: 800;
  z-index: 999;
`;

const TweetModalDelete = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: red;
`;
const TweetModalUpdate = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const UserId = styled.span`
  margin-left: 5px;
  font-size: 13px;
  opacity: 0.5;
`;

const Payload = styled.p`
  margin: 7px 0px;
  font-size: 16px;
`;

const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  margin: 20px 0px;
  &::placeholder {
    font: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const CancelButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const EditButton = styled.button`
  background-color: green;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 5px;
`;

const SaveButton = styled.button`
  background-color: green;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 5px;
`;

const AttechFileButton = styled.label`
  padding: 5px 10px;
  background-color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 5px;
`;

const AttechFileInput = styled.input`
  display: none;
`;

const OptionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  color: rgb(113, 118, 123);
  svg {
    width: 20px;
    cursor: pointer;
    border-radius: 50%;
  }
  > div:first-child {
    &:hover {
      color: red;
    }
  }
  > svg:first-child {
    &:hover {
      background-color: rgba(255, 0, 0, 0.2);
    }
  }
  > svg:nth-child(2) {
    &:hover {
      color: #74b9ff;
      background-color: rgba(116, 185, 255, 0.2);
    }
  }
  > svg:nth-child(3) {
    &:hover {
      color: #44d62c;
      background-color: rgba(68, 214, 44, 0.2);
    }
  }
  > svg:last-child {
    &:hover {
      color: #74b9ff;
      background-color: rgba(116, 185, 255, 0.2);
    }
  }
`;

const LikesButton = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LikeCount = styled.span``;

export default function Tweet({ username, photo, tweet, userId, id, email, profile }: ITweet) {
  const user = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTweet, setEditedTweet] = useState(tweet);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const onDelete = async () => {
    const ok = confirm("Are u sure u want to delete this tweet?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    } finally {
      //
    }
  };

  const onEdit = () => {
    if (user?.uid !== userId) return;
    setIsEditing(true);
  };

  const onSaveEdit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || tweet === "" || tweet.length > 180) return;
    try {
      await updateDoc(doc(db, "tweets", id), { tweet: editedTweet });
      if (editFile) {
        const locationRef = ref(storage, `tweets/${user.uid}/${id}`);
        const result = await uploadBytes(locationRef, editFile);
        const url = await getDownloadURL(result.ref);
        await updateDoc(doc(db, "tweets", id), {
          photo: url,
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsEditing(false);
    }
  };

  const onCancelEdit = () => {
    setIsEditing(false);
    setEditedTweet(tweet);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      if (files[0].size > 1024 * 1024) {
        return window.alert("Please choose a file smaller than 1MB.");
      }
      setEditFile(files[0]);
    }
  };

  return (
    <Wrapper>
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
      <Username>
        <div>
          {username}
          <UserId>@{email}</UserId>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
          onClick={toggleModal}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
        {modalOpen ? (
          <TweetModalContainer id="TweetModal" className="hidden modal">
            <TweetModalDelete>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 modal"
                onClick={onDelete}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              <span>삭제하기</span>
            </TweetModalDelete>
            <TweetModalUpdate>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 modal"
                onClick={onEdit}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              <span>수정하기</span>
            </TweetModalUpdate>
          </TweetModalContainer>
        ) : null}
      </Username>
      {photo ? <Photo src={photo} /> : null}
      <Column>
        {isEditing ? (
          // 편집 모드인 경우 입력 필드와 확인, 취소 버튼을 렌더링
          <>
            <TextArea value={editedTweet} onChange={(e) => setEditedTweet(e.target.value)} />
            <SaveButton onClick={onSaveEdit}>Save</SaveButton>
            <CancelButton onClick={onCancelEdit}>Cancel</CancelButton>
            <AttechFileButton htmlFor="EditFile">
              {editFile ? "Photo added ✅" : "Add photo"}
            </AttechFileButton>
            <AttechFileInput onChange={onFileChange} type="file" id="EditFile" accept="image/*" />
          </>
        ) : (
          // 편집 모드가 아닌 경우 트윗 내용을 표시하고 Edit 및 Delete 버튼을 렌더링
          <>
            <Payload>{tweet}</Payload>
            {user?.uid === userId ? <EditButton onClick={onEdit}>Edit</EditButton> : null}
            {user?.uid === userId ? <DeleteButton onClick={onDelete}>Delete</DeleteButton> : null}
          </>
        )}
      </Column>
      <OptionButtons>
        <LikesButton>
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
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>

          <LikeCount>0</LikeCount>
        </LikesButton>
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
            d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
          />
        </svg>
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
            d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
          />
        </svg>
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
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
      </OptionButtons>
    </Wrapper>
  );
}
