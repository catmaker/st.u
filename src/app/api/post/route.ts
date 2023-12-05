import { NextResponse, NextRequest } from "next/server";
import Post from "@/models/post";
import connectDB from "@/config/db/connectDB";
import StudyPost from "@/models/study_post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const withErrorHandling =
  (fn: (data: any) => Promise<NextResponse>) => async (req: NextRequest) => {
    try {
      const data = await req.json();

      if (
        !data.item_name ||
        !data.page_link ||
        !data.study_topic ||
        !data.study_duration ||
        !data.study_capacity ||
        !data.study_deadline ||
        !data.study_name
      ) {
        return NextResponse.json({ msg: "Invalid data" }, { status: 400 });
      }

      return await fn(data);
    } catch (error) {
      return NextResponse.json({ msg: "error message!" }, { status: 500 });
    }
  };

export const POST = withErrorHandling(async (data) => {
  let session = await getServerSession(authOptions);
  if (session) {
    data.author = session?.user?.email;
  }
  console.log(data);
  await connectDB();
  const post = new Post(data);
  const result = await post.save();
  // 리디렉션 URL을 포함한 JSON 응답 반환
  return NextResponse.json({ redirectURL: "/" });
});

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const post = await Post.find({});
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
};
