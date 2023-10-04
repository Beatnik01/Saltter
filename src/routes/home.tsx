import styled from "styled-components";
import PostTweetForm from "../components/post-tweet-form";
import Timeline from "../components/timeline";

const Wrapper = styled.div`
  display: grid;
  gap: 50px;
  overflow-y: scroll;
  overflow-y: scroll; /* 항상 스크롤바를 표시하지만 내용이 넘칠 때만 활성화됩니다. */
  scrollbar-width: none; /* Firefox 브라우저에서 기본 스크롤바를 숨깁니다. */
  -ms-overflow-style: none; /* Internet Explorer 브라우저에서 기본 스크롤바를 숨깁니다. */
  &::-webkit-scrollbar {
    width: 0 !important; /* Chrome 및 Safari 브라우저에서 기본 스크롤바를 숨깁니다. */
    grid-template-rows: 1fr 5fr;
  }
`;

export default function Home() {
  return (
    <Wrapper>
      <PostTweetForm />
      <Timeline />
    </Wrapper>
  );
}
