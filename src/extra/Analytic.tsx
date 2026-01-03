'use client';

import dayjs from "dayjs";
import moment from "moment";
import { useEffect, useState } from "react";
import DateRangePicker from "react-bootstrap-daterangepicker";
import $ from "jquery";
import "daterangepicker/daterangepicker.css";
import "bootstrap/dist/css/bootstrap.css"; // Ensure bootstrap CSS is present if needed, though layout had daterangepicker css.

if (typeof window !== "undefined") {
  (window as any).$ = (window as any).jQuery = $;
}

export default function Analytics(props: any) {
  const {
    analyticsStartDate,
    analyticsStartEnd,
    analyticsStartDateSet,
    direction,
    analyticsStartEndSet,
    allAllow,
    color,
    bgColor,
  } = props;

  const [state, setState] = useState({
    start: moment().subtract(29, "days"),
    end: moment(),
  });

  const handleApply = (_: any, picker: any) => {
    let start = dayjs(picker.startDate).format("YYYY-MM-DD");
    let end = dayjs(picker.endDate).format("YYYY-MM-DD");

    if (picker.chosenLabel === "All") {
      start = "All";
      end = "All";
    }

    analyticsStartDateSet(start);
    analyticsStartEndSet(end);
  };

  const handleCallback = (start: any, end: any) => {
    setState({ start, end });
  };

  return (
    <div
      className="d-flex my-2"
      style={{ width: "300px", justifyContent: direction }}
    >
      <DateRangePicker
        initialSettings={{
          ranges: {
            ...(allAllow !== false && { All: "All" }),
            Today: [moment().toDate(), moment().toDate()],
            Yesterday: [
              moment().subtract(1, "days").toDate(),
              moment().subtract(1, "days").toDate(),
            ],
            "Last 7 Days": [
              moment().subtract(6, "days").toDate(),
              moment().toDate(),
            ],
            "Last 30 Days": [
              moment().subtract(29, "days").toDate(),
              moment().toDate(),
            ],
            "This Month": [
              moment().startOf("month").toDate(),
              moment().endOf("month").toDate(),
            ],
            "Last Month": [
              moment().subtract(1, "month").startOf("month").toDate(),
              moment().subtract(1, "month").endOf("month").toDate(),
            ],
          },
        }}
        onCallback={handleCallback}
        onApply={handleApply}
      >
        <input
          type="text"
          readOnly
          className={`daterange text-center ${bgColor} ${color}`}
          value={
            analyticsStartDate && analyticsStartEnd
              ? `${analyticsStartDate} To ${analyticsStartEnd}`
              : "Select Date Range"
          }
          style={{
            width: "85%",
            cursor: "pointer",
            border: "1px solid #8F6DFF24",
            fontSize: "14px",
            padding: "9px",
            borderRadius: "6px",
            color: "rgb(131,131,131)",
            outline: "none",
            boxShadow: "0px 0px 1px rgba(0, 0, 0, 0.2)",
          }}
        />
      </DateRangePicker>
    </div>
  );
}