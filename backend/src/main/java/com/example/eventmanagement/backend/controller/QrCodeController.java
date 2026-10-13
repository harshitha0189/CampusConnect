
package com.example.eventmanagement.backend.controller;

import com.example.eventmanagement.backend.service.QrCodeService;
import com.google.zxing.WriterException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/qr")
public class QrCodeController {

    private final QrCodeService qrCodeService;

    public QrCodeController(QrCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    @GetMapping(
        value = "/{ticketCode}",
        produces = MediaType.IMAGE_PNG_VALUE
    )
    public ResponseEntity<byte[]> generateQRCode(
            @PathVariable String ticketCode)
            throws WriterException, IOException {

        byte[] qrCode = qrCodeService.generateQRCode(
            ticketCode, 300, 300
        );

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qrCode);
    }
}
