import React from "react";
import { useSession } from "next-auth/react";
import Card from "@/components/common/Card";
import CommentForm from "@/components/Comment/CommentForm";
import SingleComment from "@/components/Comment/SingleComment";
import Button from "@/components/common/Button";
import { IResponseBoard } from "@/interfaces/study_board";
import style from "./boardPost.module.css";

const BoardPost = ({ _id, contents, createdAt }: IResponseBoard) => {
  const { data } = useSession();
  const user = data?.user;
  return (
    <div className={style.board_post_wrap}>
      <div className={style.board_post_container}>
        <div className="post_wrap">
          {
              <Card
                name="강하늘"
                imagePath={user?.image as string}
                actionEl={<Button text="삭제" className={style.post_btn_delete}/>}
                contentEl={contents}
              />
          }
        </div>
        <div className={style.post_reaction}>
          <div>
            <span>좋아요 icon {0}</span>
          </div>
        </div>
      </div>
      <div className={style.comment_container}>
        <div>
          <CommentForm boardId="" />
        </div>
        <div>
          <SingleComment boardPostId={_id} />
        </div>
      </div>
    </div>
  );
};

export default BoardPost;
