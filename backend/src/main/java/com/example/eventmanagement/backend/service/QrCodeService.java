package com.example.eventmanagement.backend.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class QrCodeService {

    public byte[] generateQRCode(
            String text, int width, int height)
            throws WriterException, IOException {

        QRCodeWriter writer = new QRCodeWriter();

        BitMatrix matrix = writer.encode(
                text,
                BarcodeFormat.QR_CODE,
                width,
                height
        );

        ByteArrayOutputStream output =
                new ByteArrayOutputStream();

        MatrixToImageWriter.writeToStream(
                matrix, "PNG", output
        );

        return output.toByteArray();
    }
}