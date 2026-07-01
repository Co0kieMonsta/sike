import { NextResponse } from "next/server";
import { projects } from "../data";

export async function GET(request, { params }) {
  const { id } = await params;

  const item = projects.find((item) => item.id === parseInt(id));

  if (item) {
    return NextResponse.json(item, { status: 200 });
  } else {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }
}

export async function PUT(request, { params }) {
  const payloadItem = await request.json();
  const index = projects.findIndex(
    (item) => item.id === parseInt(payloadItem.id)
  );

  if (index !== -1) {
    projects[index] = payloadItem;

    return NextResponse.json(
      { message: "Item updated successfully" },
      { status: 200 }
    );
  } else {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;

  const index = projects.findIndex((item) => item.id === parseInt(id));

  if (index !== -1) {
    // Remove the item from the array
    projects.splice(index, 1);
    return NextResponse.json(
      { message: "Item deleted successfully" },
      { status: 200 }
    );
  } else {
    return NextResponse.json({ message: "Item not found" }, { status: 404 });
  }
}
