#ifndef FACES_H
#define FACES_H

#include <Arduino.h>
#include <Adafruit_GFX.h>
#include <Adafruit_GC9A01A.h>

// Define our emotions
enum Emotion {
    HAPPY,
    THIRSTY,
    HOT,
    COLD,
    SLEEPY
};

// --- Custom Colors ---
#define COLOR_HAPPY_GLOW   0x07FF  // Neon Cyan
#define COLOR_THIRSTY_GLOW 0xFD20  // Neon Orange
#define COLOR_HOT_GLOW     0xF800  // Neon Red
#define COLOR_COLD_GLOW    0x3DDF  // Ice Blue / Sky Blue
#define COLOR_SLEEPY_GLOW  0x7BEF  // Dim Pale Blue/Gray

// Animation state structure
struct FaceState {
    unsigned long lastBlinkTime = 0;
    unsigned long blinkStartTime = 0;
    unsigned long nextBlinkDelay = 3000;
    bool isBlinking = false;
    
    Emotion lastEmotion = HAPPY;
    bool initialized = false;
};

// Global face state instance (since faces.h is only included in main.cpp)
static FaceState faceState;

// Inline helpers for drawing eye styles

inline void drawThirstyEye(Adafruit_GC9A01A& tft, int centerX, int centerY, int w, int h, int r, float scaleY, float breathing, bool isLeft) {
    float curH = (h + breathing) * scaleY;
    if (curH > 12) {
        int drawY = centerY - curH / 2;
        tft.fillRoundRect(centerX - w/2, drawY, w, curH, r, COLOR_THIRSTY_GLOW);
        tft.fillRoundRect(centerX - w/2 + 4, drawY + 4, w - 8, curH - 8, r - 2, GC9A01A_BLACK);
        
        // Draw glint
        tft.fillCircle(centerX + (isLeft ? 6 : 10), centerY - curH/4, 3, GC9A01A_WHITE);
        
        // Draw sad cut (top-inner corner)
        if (isLeft) {
            // Cut top-right
            tft.fillTriangle(centerX, drawY - 1, 
                             centerX + w/2 + 1, drawY - 1, 
                             centerX + w/2 + 1, drawY + curH/3, GC9A01A_BLACK);
        } else {
            // Cut top-left
            tft.fillTriangle(centerX, drawY - 1, 
                             centerX - w/2 - 1, drawY - 1, 
                             centerX - w/2 - 1, drawY + curH/3, GC9A01A_BLACK);
        }
    } else {
        tft.fillRoundRect(centerX - w/2, centerY - 2, w, 4, 2, COLOR_THIRSTY_GLOW);
    }
}

inline void drawHotEye(Adafruit_GC9A01A& tft, int centerX, int centerY, int w, int h, int r, float scaleY, float breathing, bool isLeft) {
    float curH = (h + breathing) * scaleY;
    if (curH > 12) {
        int drawY = centerY - curH / 2;
        tft.fillRoundRect(centerX - w/2, drawY, w, curH, r, COLOR_HOT_GLOW);
        tft.fillRoundRect(centerX - w/2 + 4, drawY + 4, w - 8, curH - 8, r - 2, GC9A01A_BLACK);
        
        // Draw glint
        tft.fillCircle(centerX + (isLeft ? 6 : 10), centerY - curH/4, 3, GC9A01A_WHITE);
        
        // Draw angry cut (top-outer corner)
        if (isLeft) {
            // Cut top-left
            tft.fillTriangle(centerX, drawY - 1, 
                             centerX - w/2 - 1, drawY - 1, 
                             centerX - w/2 - 1, drawY + curH/3, GC9A01A_BLACK);
        } else {
            // Cut top-right
            tft.fillTriangle(centerX, drawY - 1, 
                             centerX + w/2 + 1, drawY - 1, 
                             centerX + w/2 + 1, drawY + curH/3, GC9A01A_BLACK);
        }
    } else {
        tft.fillRoundRect(centerX - w/2, centerY - 2, w, 4, 2, COLOR_HOT_GLOW);
    }
}

inline void drawColdEye(Adafruit_GC9A01A& tft, int centerX, int centerY, int w, int h, int r, float scaleY, float breathing, int shiverX, int shiverY, bool isLeft) {
    float curH = (h * 0.85 + breathing) * scaleY;
    int cx = centerX + shiverX;
    int cy = centerY + shiverY;
    if (curH > 12) {
        int drawY = cy - curH / 2;
        tft.fillRoundRect(cx - w/2, drawY, w, curH, r, COLOR_COLD_GLOW);
        tft.fillRoundRect(cx - w/2 + 4, drawY + 4, w - 8, curH - 8, r - 2, GC9A01A_BLACK);
        tft.fillCircle(cx + (isLeft ? 6 : 10), cy - curH/4, 3, GC9A01A_WHITE);
    } else {
        tft.fillRoundRect(cx - w/2, cy - 2, w, 4, 2, COLOR_COLD_GLOW);
    }
}

// Resets face state forcing full redraw on next frame
inline void resetFaceState() {
    faceState.initialized = false;
}

// Modernized animation face drawer called in loop()
inline void animateFace(Adafruit_GC9A01A& tft, Emotion e) {
    unsigned long currentMillis = millis();
    
    // Cap update rate at ~30 FPS (every 33ms)
    static unsigned long lastFrameTime = 0;
    if (currentMillis - lastFrameTime < 33 && faceState.initialized && faceState.lastEmotion == e) {
        return;
    }
    lastFrameTime = currentMillis;

    // Reset screen if emotion changed or not initialized
    if (!faceState.initialized || faceState.lastEmotion != e) {
        tft.fillScreen(GC9A01A_BLACK);
        faceState.initialized = true;
        faceState.lastEmotion = e;
        faceState.isBlinking = false;
        faceState.lastBlinkTime = currentMillis;
        faceState.nextBlinkDelay = random(3000, 6000);
    }

    // Update blink state (Sleepy eyes do not blink)
    float scaleY = 1.0;
    if (e != SLEEPY) {
        if (!faceState.isBlinking) {
            if (currentMillis - faceState.lastBlinkTime >= faceState.nextBlinkDelay) {
                faceState.isBlinking = true;
                faceState.blinkStartTime = currentMillis;
            }
        } else {
            unsigned long elapsed = currentMillis - faceState.blinkStartTime;
            if (elapsed < 100) {
                // Closing
                scaleY = 1.0 - ((float)elapsed / 100.0);
            } else if (elapsed < 200) {
                // Opening
                scaleY = ((float)(elapsed - 100) / 100.0);
            } else {
                // Done blinking
                faceState.isBlinking = false;
                faceState.lastBlinkTime = currentMillis;
                faceState.nextBlinkDelay = random(3000, 6000);
                scaleY = 1.0;
            }
        }
    }

    // Update breathing phase
    float breathing = 0;
    if (e == SLEEPY) {
        breathing = sin(currentMillis / 1000.0) * 1.5; // Slow breathing
    } else if (e != COLD) {
        breathing = sin(currentMillis / 400.0) * 1.5;  // Standard breathing
    }

    // Jitter for cold shivering
    int shiverX = 0;
    int shiverY = 0;
    if (e == COLD) {
        shiverX = random(-1, 2);
        shiverY = random(-1, 2);
    }

    // Eye specs
    int w = 46;
    int h = 56;
    int r = 14;
    int leftCenterX = 80;
    int rightCenterX = 160;
    int centerY = 110;

    // Clear previous eye regions (bounding boxes of 60x80)
    tft.fillRect(leftCenterX - 30, centerY - 40, 60, 80, GC9A01A_BLACK);
    tft.fillRect(rightCenterX - 30, centerY - 40, 60, 80, GC9A01A_BLACK);

    // Draw eyes based on emotion
    switch (e) {
        case HAPPY: {
            float curH = (h + breathing) * scaleY;
            int drawY = centerY - curH / 2;
            uint16_t color = COLOR_HAPPY_GLOW;
            
            // Left eye
            if (curH > 12) {
                tft.fillRoundRect(leftCenterX - w/2, drawY, w, curH, r, color);
                tft.fillRoundRect(leftCenterX - w/2 + 4, drawY + 4, w - 8, curH - 8, r - 2, GC9A01A_BLACK);
                tft.fillCircle(leftCenterX + 6, centerY - curH/4, 3, GC9A01A_WHITE);
            } else {
                tft.fillRoundRect(leftCenterX - w/2, centerY - 2, w, 4, 2, color);
            }
            
            // Right eye
            if (curH > 12) {
                tft.fillRoundRect(rightCenterX - w/2, drawY, w, curH, r, color);
                tft.fillRoundRect(rightCenterX - w/2 + 4, drawY + 4, w - 8, curH - 8, r - 2, GC9A01A_BLACK);
                tft.fillCircle(rightCenterX + 10, centerY - curH/4, 3, GC9A01A_WHITE);
            } else {
                tft.fillRoundRect(rightCenterX - w/2, centerY - 2, w, 4, 2, color);
            }
            break;
        }

        case THIRSTY: {
            drawThirstyEye(tft, leftCenterX, centerY, w, h, r, scaleY, breathing, true);
            drawThirstyEye(tft, rightCenterX, centerY, w, h, r, scaleY, breathing, false);
            break;
        }

        case HOT: {
            drawHotEye(tft, leftCenterX, centerY, w, h, r, scaleY, breathing, true);
            drawHotEye(tft, rightCenterX, centerY, w, h, r, scaleY, breathing, false);
            break;
        }

        case COLD: {
            drawColdEye(tft, leftCenterX, centerY, w, h, r, scaleY, breathing, shiverX, shiverY, true);
            drawColdEye(tft, rightCenterX, centerY, w, h, r, scaleY, breathing, shiverX, shiverY, false);
            break;
        }

        case SLEEPY: {
            uint16_t color = COLOR_SLEEPY_GLOW;
            int cy = centerY - 5 + (int)breathing;
            
            // Left eye (downward curved arch)
            tft.fillCircle(leftCenterX, cy, 22, color);
            tft.fillRect(leftCenterX - 25, cy - 25, 50, 25, GC9A01A_BLACK);
            tft.fillCircle(leftCenterX, cy, 18, GC9A01A_BLACK);
            tft.fillRect(leftCenterX - 25, cy - 25, 50, 25, GC9A01A_BLACK);
            
            // Right eye (downward curved arch)
            tft.fillCircle(rightCenterX, cy, 22, color);
            tft.fillRect(rightCenterX - 25, cy - 25, 50, 25, GC9A01A_BLACK);
            tft.fillCircle(rightCenterX, cy, 18, GC9A01A_BLACK);
            tft.fillRect(rightCenterX - 25, cy - 25, 50, 25, GC9A01A_BLACK);
            break;
        }
    }
}

// Deprecated fallback - mapped to animateFace for backward compatibility
inline void drawFace(Adafruit_GC9A01A& tft, Emotion e) {
    animateFace(tft, e);
}

#endif
