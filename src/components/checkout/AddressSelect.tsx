"use client";

import { useState } from "react";
import { TAIWAN_COUNTIES, COUNTY_LIST } from "@/data/taiwan-districts";

interface AddressSelectProps {
  value: string;
  onChange: (address: string) => void;
  required?: boolean;
}

export function AddressSelect({ value, onChange, required }: AddressSelectProps) {
  const [county, setCounty] = useState("");
  const [district, setDistrict] = useState("");
  const [detail, setDetail] = useState("");

  const districts = county ? TAIWAN_COUNTIES[county] || [] : [];

  const handleCounty = (c: string) => {
    setCounty(c); setDistrict("");
    const full = detail ? `${c}${detail}` : c;
    onChange(full);
  };

  const handleDistrict = (d: string) => {
    setDistrict(d);
    const full = detail ? `${county}${d}${detail}` : `${county}${d}`;
    onChange(full);
  };

  const handleDetail = (d: string) => {
    setDetail(d);
    const full = district ? `${county}${district}${d}` : county ? `${county}${d}` : d;
    onChange(full);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <select
          required={required}
          value={county}
          onChange={e => handleCounty(e.target.value)}
          className="w-full bg-ash-gray-50 border-0 px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-ash-black"
        >
          <option value="">選擇縣市</option>
          {COUNTY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          required={required}
          value={district}
          onChange={e => handleDistrict(e.target.value)}
          disabled={!county}
          className="w-full bg-ash-gray-50 border-0 px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-ash-black disabled:opacity-40"
        >
          <option value="">選擇區域</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <input
        required={required}
        value={detail}
        onChange={e => handleDetail(e.target.value)}
        placeholder="請輸入詳細地址（路/街/巷/號/樓）"
        className="w-full bg-ash-gray-50 border-0 px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-ash-black"
      />
    </div>
  );
}
