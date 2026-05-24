"use client";

import "@/bones/registry";
import { Skeleton } from "boneyard-js/react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
      <Skeleton
        name="app-shell"
        loading={true}
        animate="shimmer"
        transition={300}
        fallback={
          <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
            <div className="mx-auto max-w-5xl space-y-8">
              <div className="h-16 rounded-3xl bg-gray-100" />
              <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                <div className="space-y-4">
                  <div className="h-12 rounded-2xl bg-gray-100" />
                  <div className="h-12 rounded-2xl bg-gray-100" />
                  <div className="h-12 rounded-2xl bg-gray-100" />
                </div>
                <div className="space-y-6">
                  <div className="h-10 rounded-2xl bg-gray-100" />
                  <div className="h-72 rounded-4xl bg-gray-100" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="h-40 rounded-3xl bg-gray-100" />
                    <div className="h-40 rounded-3xl bg-gray-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="h-16 rounded-3xl bg-gray-100" />
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <div className="space-y-4">
              <div className="h-12 rounded-2xl bg-gray-100" />
              <div className="h-12 rounded-2xl bg-gray-100" />
              <div className="h-12 rounded-2xl bg-gray-100" />
            </div>
            <div className="space-y-6">
              <div className="h-10 rounded-2xl bg-gray-100" />
              <div className="h-72 rounded-4xl bg-gray-100" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-40 rounded-3xl bg-gray-100" />
                <div className="h-40 rounded-3xl bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </Skeleton>
    </div>
  );
}
