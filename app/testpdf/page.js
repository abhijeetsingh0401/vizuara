'use client'
import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import PDFTextExtractor from "@components/PdfTextExtractor";

export default function PDF() {

    return (
        <PDFTextExtractor />
    )
}
