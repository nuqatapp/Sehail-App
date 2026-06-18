import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  Share,
  I18nManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn, FadeInUp } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import wisdomData from "@/data/wisdom.json";
import PressableSurface from "@/components/PressableSurface";

const SCORES_KEY = "sehail_quiz_scores";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizSection {
  id: string;
  title: string;
  icon: string;
  questions: Question[];
}

interface ScoreData {
  best: number;
  total: number;
}

interface AllScores {
  [quizId: string]: ScoreData;
}

function toArabicNum(n: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).replace(/\d/g, (d) => arabicDigits[parseInt(d)]);
}

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const webBottomInset = Platform.OS === "web" ? 34 : 0;
  const quizzesData = (wisdomData as any).categories?.quizzes;
  const sections = (quizzesData?.sections || []) as QuizSection[];

  const [scores, setScores] = useState<AllScores>({});
  const [activeQuiz, setActiveQuiz] = useState<QuizSection | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SCORES_KEY).then((val) => {
      if (val) {
        try {
          setScores(JSON.parse(val));
        } catch {}
      }
    });
  }, []);

  const startQuiz = useCallback((section: QuizSection) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveQuiz(section);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setCorrectCount(0);
    setShowResult(false);
  }, []);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAnswer(answerIndex);

    if (!activeQuiz) return;
    const isCorrect = answerIndex === activeQuiz.questions[currentIndex].correct;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
  }, [selectedAnswer, activeQuiz, currentIndex]);

  const handleNext = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!activeQuiz) return;
    if (currentIndex < activeQuiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      const finalCorrect = correctCount;
      const total = activeQuiz.questions.length;
      const quizId = activeQuiz.id;

      const existingBest = scores[quizId]?.best ?? 0;
      const newBest = Math.max(existingBest, finalCorrect);
      const newScores = { ...scores, [quizId]: { best: newBest, total } };
      setScores(newScores);
      await AsyncStorage.setItem(SCORES_KEY, JSON.stringify(newScores));
      setShowResult(true);
    }
  }, [currentIndex, activeQuiz, selectedAnswer, correctCount, scores]);

  const handleShare = useCallback(async () => {
    if (!activeQuiz) return;
    const total = activeQuiz.questions.length;
    try {
      await Share.share({
        message: `جبت ${correctCount} من ${total} في ${activeQuiz.title} على تطبيق سهيل!`,
      });
    } catch {}
  }, [activeQuiz, correctCount]);

  const handleRetry = useCallback(() => {
    if (activeQuiz) startQuiz(activeQuiz);
  }, [activeQuiz, startQuiz]);

  const handleBack = useCallback(() => {
    setActiveQuiz(null);
    setShowResult(false);
  }, []);

  if (showResult && activeQuiz) {
    const total = activeQuiz.questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const isGreat = percentage >= 80;

    return (
      <View {...(Platform.OS === "web" ? { dir: I18nManager.isRTL ? "rtl" : "ltr" } : {})} style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 40 + webBottomInset },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.resultCard}>
            <Ionicons
              name={isGreat ? "trophy" : "trophy-outline"}
              size={56}
              color={isGreat ? Colors.primary.gold : Colors.text.tertiary}
            />
            <Text style={styles.resultTitle}>
              {isGreat ? "ممتاز!" : "حاول مرة ثانية"}
            </Text>
            <Text style={styles.resultScore}>
              جبت {toArabicNum(correctCount)} من {toArabicNum(total)}
            </Text>
            <View style={styles.resultPercentContainer}>
              <View style={styles.resultPercentBar}>
                <View
                  style={[
                    styles.resultPercentFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: isGreat ? Colors.primary.green : Colors.primary.gold,
                    },
                  ]}
                />
              </View>
              <Text style={styles.resultPercentText}>{toArabicNum(percentage)}٪</Text>
            </View>

            <View style={styles.resultButtonsRow}>
              <PressableSurface
                accessibilityRole="button"
                accessibilityLabel="شارك النتيجة"
                hitSlop={10}
                baseStyle={[styles.resultButton, styles.resultButtonShare]}
                hoverStyle={styles.resultButtonHover}
                focusStyle={styles.resultButtonFocus}
                pressedStyle={{ opacity: 0.7 }}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color={Colors.primary.green} />
                <Text style={styles.resultButtonTextGreen}>شارك</Text>
              </PressableSurface>
              <PressableSurface
                accessibilityRole="button"
                accessibilityLabel="أعد الاختبار"
                hitSlop={10}
                baseStyle={[styles.resultButton, styles.resultButtonRetry]}
                hoverStyle={styles.resultButtonHover}
                focusStyle={styles.resultButtonFocus}
                pressedStyle={{ opacity: 0.7 }}
                onPress={handleRetry}
              >
                <Ionicons name="refresh-outline" size={20} color={Colors.primary.gold} />
                <Text style={styles.resultButtonTextGold}>حاول مرة ثانية</Text>
              </PressableSurface>
            </View>

            <PressableSurface
              accessibilityRole="button"
              accessibilityLabel="رجوع لقائمة الاختبارات"
              hitSlop={10}
              baseStyle={styles.backToListButton}
              hoverStyle={styles.backToListFocus}
              focusStyle={styles.backToListFocus}
              pressedStyle={{ opacity: 0.7 }}
              onPress={handleBack}
            >
              <Text style={styles.backToListText}>رجوع للقائمة</Text>
            </PressableSurface>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  if (activeQuiz) {
    const question = activeQuiz.questions[currentIndex];
    const total = activeQuiz.questions.length;
    const isAnswered = selectedAnswer !== null;
    const isCorrect = selectedAnswer === question.correct;

    return (
      <View {...(Platform.OS === "web" ? { dir: I18nManager.isRTL ? "rtl" : "ltr" } : {})} style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 40 + webBottomInset },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {toArabicNum(currentIndex + 1)} / {toArabicNum(total)}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentIndex + 1) / total) * 100}%` },
                ]}
              />
            </View>
          </View>

          <Animated.View key={question.id} entering={FadeInDown.duration(400)} style={styles.questionCard}>
            <Text style={styles.questionText}>{question.question}</Text>
          </Animated.View>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => {
              const isThisCorrect = index === question.correct;
              const isThisWrong = isAnswered && index === selectedAnswer && !isCorrect;
              let iconName: keyof typeof Ionicons.glyphMap | null = null;
              let iconColor = Colors.text.tertiary;

              if (isAnswered && isThisCorrect) {
                iconName = "checkmark-circle";
                iconColor = Colors.status.success;
              } else if (isThisWrong) {
                iconName = "close-circle";
                iconColor = Colors.status.danger;
              }

              return (
                <Animated.View key={index} entering={FadeInUp.delay(index * 80).duration(300)}>
                  <PressableSurface
                    accessibilityRole="button"
                    accessibilityLabel={`اختر ${option}`}
                    accessibilityState={{ selected: isAnswered && index === selectedAnswer }}
                    hitSlop={10}
                    baseStyle={[
                      styles.optionCard,
                      isAnswered && isThisCorrect && styles.optionCorrect,
                      isThisWrong && styles.optionWrong,
                    ]}
                    hoverStyle={styles.optionHover}
                    focusStyle={styles.optionFocus}
                    pressedStyle={!isAnswered ? { opacity: 0.7, transform: [{ scale: 0.98 }] } : undefined}
                    onPress={() => handleAnswer(index)}
                    disabled={isAnswered}
                  >
                    <View style={styles.optionInner}>
                      {iconName && (
                        <Ionicons name={iconName} size={22} color={iconColor} style={styles.optionIcon} />
                      )}
                      <Text style={[
                        styles.optionText,
                        isAnswered && isThisCorrect && styles.optionTextCorrect,
                        isThisWrong && styles.optionTextWrong,
                      ]}>{option}</Text>
                    </View>
                  </PressableSurface>
                </Animated.View>
              );
            })}
          </View>

          {isAnswered && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.explanationCard}>
              <Ionicons
                name={isCorrect ? "checkmark-circle" : "close-circle"}
                size={20}
                color={isCorrect ? Colors.status.success : Colors.status.danger}
              />
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </Animated.View>
          )}

          {isAnswered && (
            <Animated.View entering={FadeIn.delay(200).duration(300)}>
              <PressableSurface
                accessibilityRole="button"
                accessibilityLabel={currentIndex < total - 1 ? "السؤال التالي" : "عرض النتيجة"}
                hitSlop={10}
                baseStyle={styles.nextButton}
                hoverStyle={styles.nextButtonHover}
                focusStyle={styles.nextButtonFocus}
                pressedStyle={{ opacity: 0.8 }}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>
                  {currentIndex < total - 1 ? "السؤال التالي" : "النتيجة"}
                </Text>
                <Ionicons name="arrow-back" size={18} color="#fff" />
              </PressableSurface>
            </Animated.View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View {...(Platform.OS === "web" ? { dir: I18nManager.isRTL ? "rtl" : "ltr" } : {})} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 40 + webBottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, index) => {
          const bestScore = scores[section.id];
          return (
            <Animated.View key={section.id} entering={FadeInDown.delay(index * 100).duration(500)}>
              <PressableSurface
                accessibilityRole="button"
                accessibilityLabel={`ابدأ اختبار ${section.title}`}
                hitSlop={10}
                baseStyle={[
                  styles.quizCard,
                ]}
                hoverStyle={styles.quizCardHover}
                focusStyle={styles.quizCardFocus}
                pressedStyle={{ opacity: 0.7, transform: [{ scale: 0.98 }] }}
                onPress={() => startQuiz(section)}
              >
                <View style={styles.quizCardInner}>
                  <View style={styles.quizIconContainer}>
                    <Ionicons name={section.icon as any} size={28} color={Colors.primary.green} />
                  </View>
                  <View style={styles.quizTextContainer}>
                    <Text style={styles.quizTitle}>{section.title}</Text>
                    <Text style={styles.quizSubtitle}>
                      {toArabicNum(section.questions.length)} سؤال
                    </Text>
                  </View>
                  {bestScore && (
                    <View style={styles.bestScoreBadge}>
                      <Ionicons name="trophy-outline" size={14} color={Colors.primary.gold} />
                      <Text style={styles.bestScoreText}>
                        {toArabicNum(bestScore.best)}/{toArabicNum(bestScore.total)}
                      </Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-back" size={16} color={Colors.text.tertiary} />
              </PressableSurface>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  quizCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.card.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  quizCardHover: {
    borderColor: Colors.primary.greenLight,
  },
  quizCardFocus: {
    borderColor: Colors.primary.green,
    shadowColor: Colors.primary.green,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  quizCardInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 14,
  },
  resultButtonHover: {
    opacity: 0.96,
  },
  resultButtonFocus: {
    shadowColor: Colors.primary.green,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  backToListFocus: {
    shadowColor: Colors.primary.green,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  optionHover: {
    borderColor: Colors.primary.greenLight,
  },
  optionFocus: {
    borderColor: Colors.primary.green,
    shadowColor: Colors.primary.green,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  nextButtonHover: {
    opacity: 0.96,
  },
  nextButtonFocus: {
    shadowColor: Colors.primary.green,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  quizIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(0, 108, 53, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  quizTextContainer: {
    alignItems: "flex-end",
    flex: 1,
  },
  quizTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 17,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl" as const,
  },
  quizSubtitle: {
    fontFamily: "Cairo_400Regular",
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: "right",
    writingDirection: "rtl" as const,
    marginTop: 2,
  },
  bestScoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bestScoreText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13,
    color: Colors.primary.gold,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  progressText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
    color: Colors.text.secondary,
    minWidth: 50,
    textAlign: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary.green,
    borderRadius: 3,
  },
  questionCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.card.border,
    borderRightWidth: 3,
    borderRightColor: Colors.primary.green,
  },
  questionText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 18,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl" as const,
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.card.border,
  },
  optionCorrect: {
    borderColor: Colors.status.success,
    backgroundColor: "rgba(39, 174, 96, 0.06)",
  },
  optionWrong: {
    borderColor: Colors.status.danger,
    backgroundColor: "rgba(231, 76, 60, 0.06)",
  },
  optionInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  optionText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 15,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl" as const,
    flex: 1,
    lineHeight: 24,
  },
  optionTextCorrect: {
    color: Colors.status.success,
  },
  optionTextWrong: {
    color: Colors.status.danger,
  },
  optionIcon: {
    marginLeft: 4,
  },
  explanationCard: {
    backgroundColor: "rgba(0, 108, 53, 0.06)",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 16,
    justifyContent: "flex-end",
  },
  explanationText: {
    fontFamily: "Cairo_400Regular",
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "right",
    writingDirection: "rtl" as const,
    flex: 1,
    lineHeight: 22,
  },
  nextButton: {
    backgroundColor: Colors.primary.green,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    color: "#fff",
  },
  resultCard: {
    backgroundColor: Colors.card.background,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.card.border,
    marginTop: 20,
  },
  resultTitle: {
    fontFamily: "Cairo_700Bold",
    fontSize: 24,
    color: Colors.text.primary,
    marginTop: 16,
  },
  resultScore: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 18,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  resultPercentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    width: "100%",
  },
  resultPercentBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    borderRadius: 4,
    overflow: "hidden",
  },
  resultPercentFill: {
    height: "100%",
    borderRadius: 4,
  },
  resultPercentText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    color: Colors.primary.green,
    minWidth: 40,
    textAlign: "center",
  },
  resultButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
    width: "100%",
  },
  resultButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  resultButtonShare: {
    backgroundColor: "rgba(0, 108, 53, 0.08)",
  },
  resultButtonRetry: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  resultButtonTextGreen: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15,
    color: Colors.primary.green,
  },
  resultButtonTextGold: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15,
    color: Colors.primary.gold,
  },
  backToListButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  backToListText: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 14,
    color: Colors.text.tertiary,
  },
});
