"use client";

import Image from "next/image";
import { X } from "lucide-react";
import qrcodeImage from "@/assets/qrcode.jpg";

export default function SocialQrModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="isle-pop-in absolute inset-0 z-50 flex flex-col items-center justify-center rounded-3xl p-5 backdrop-blur-md">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-1 top-1 p-1.5 text-gray-400 transition-colors hover:text-gray-500"
        aria-label="Close WeChat QR code"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="rounded-2xl bg-white p-2 shadow-lg">
        <Image
          src={qrcodeImage}
          alt="WeChat QR Code"
          width={132}
          height={132}
          className="object-contain"
          placeholder="blur"
        />
      </div>
    </div>
  );
}
