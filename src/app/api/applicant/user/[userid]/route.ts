import Applicant from "@/models/applicant";
import { routeWrapperWithError } from "@/utils/routeWrapperWithError";
import { NextRequest, NextResponse } from "next/server";
import Member from "@/models/member";
import RecruitPost from "@/models/recruit_post";

/* 
  path: /api/applicant/user/:userId */
// 모집글 참여 신청
export const POST = routeWrapperWithError(
  async (req: NextRequest, { params }: { params: { userid: string } }) => {
    const { studyId, message } = await req.json();
    const userId = params.userid;
    if (!studyId || !message) {
      return NextResponse.json(
        { isOk: false, message: "데이터가 비어있습니다." },
        { status: 404 }
      );
    }
    const recruitpost = await RecruitPost.findByIdAndUpdate(studyId);
    console.log({
      모집인원: Number(recruitpost.headCount),
      총인원: recruitpost.applicants.length,
    });
    if (Number(recruitpost.headCount) === recruitpost.applicants.length) {
      // 모집 완료
      return NextResponse.json({
        isOk: false,
        msg: "모집 인원 완료, 더이상 참여 신청 받지 않음",
      });
    } else {
      const savedApplicant = await Applicant.create({
        applicant: userId,
        studyId,
        message,
      });
      console.log(savedApplicant._id);
      await RecruitPost.findByIdAndUpdate(studyId, {
        $push: { applicants: userId },
      });

      return NextResponse.json({ isOk: true, msg: "모집 신청 완료" });
    }
  }
);

//  모집글 참여 신청 승인 상태: "승인" | "거절"
export const PATCH = routeWrapperWithError(
  async (req: NextRequest, { params }: { params: { userid: string } }) => {
    const { studyId, recognition } = await req.json(); // "승인" 또는 "거절"
    const userId = params.userid;
    // 신청자(userId), studyId로 신청 정보 불러와서 recognition수정
    const recruitpost = await RecruitPost.findByIdAndUpdate(studyId);
    const applicants = await Applicant.findOne({ applicant: userId }).where({
      studyId,
    });
    console.log({ recognition });
    if (recognition === "승인") {
      // 승인과 동시에 Member로 등록
      const insertData = {
        member: userId,
        studyId: studyId as string,
      };

      // 멤버가 존재하는지 확인!
      /* member:UserId, studyId */
      const member = await Member.findOne({ member: userId }).where({
        studyId,
      });
      const memberAll = await Member.find({}).where({ studyId });

      if (member) {
        //이미 존재하는 경우 409 status
        return NextResponse.json("이미 등록된 멤버입니다.", { status: 409 });
      }
      // 존재하지 않으면 멤버로 저장.
      console.log({
        모집인원_리더: Number(recruitpost.headCount + 1),
        맴버수: Number(memberAll.length),
      });
      if (Number(recruitpost.headCount + 1) === memberAll.length) {
        await recruitpost.updateOne({ $set: { start: true } });
        return NextResponse.json("모집 인원 마감, 스터디 시작!!");
      } else {
        await applicants.updateOne({
          $set: {
            recognition,
          },
        });
        await Member.create(insertData);
      }
      // 멤버 크기랑 모집글 headCount
      return NextResponse.json({ isOk: true, msg: "승인 완료 및 멤버 등록" });
    } else {
      await applicants.updateOne({
        $set: {
          recognition,
        },
      });
      return NextResponse.json("거절 되었습니다.");
    }
  }
);
