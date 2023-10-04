import styled from "styled-components";
import { ITweet } from "../components/timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useState } from "react";

const Wrapper = styled.div`
  display: gird;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div``;

const Photo = styled.img`
  width: 500px;
  height: 500px;
  border-radius: 15px;
  margin: 20px 0px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 20px;
`;

const Payload = styled.p`
  margin-bottom: 20px;
  font-size: 18px;
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
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
      Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
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

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const user = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [editedTweet, setEditedTweet] = useState(tweet);
  const [editFile, setEditFile] = useState<File | null>(null);

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
      <Username>{username}</Username>
      {photo ? (
        <Column>
          <Photo src={photo} />
        </Column>
      ) : null}
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
    </Wrapper>
  );
}
