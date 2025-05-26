import React, { useState, useEffect, useRef } from "react";
import { 
  Button, 
  Text, 
  Title1,
  makeStyles,
  MessageBar,
  MessageBarBody,
  tokens
} from "@fluentui/react-components";
import * as microsoftTeams from "@microsoft/teams-js";

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalM,
  },
  buttonContainer: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  audio: {
    marginTop: '20px',
    width: '100%'
  }
});

const AudioCapture: React.FC = () => {
  const styles = useStyles();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // Teams SDKの初期化
  useEffect(() => {
    const initializeTeams = async () => {
      try {
        // Teams SDKを初期化
        await microsoftTeams.app.initialize();
        console.log("Teams SDKが初期化されました");

        // Teams コンテキストを確認
        const context = await microsoftTeams.app.getContext();
        console.log("Teams コンテキスト:", context);
        
        try {
          // メディアデバイスが利用可能かチェック
          if (navigator.mediaDevices) {
            console.log("getUserMedia APIが利用可能です");

            // マイクの権限状態を確認
            try {
              const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
              console.log("マイク権限の状態:", permissionStatus.state);
            } catch (err) {
              console.error("権限APIがサポートされていません", err);
            }
          } else {
            console.log("getUserMedia APIは利用できません");
          }

          // Teams メディアAPIの確認
          if (microsoftTeams.media) {
            console.log("Teams メディアAPIが利用可能です");
          }
        } catch (permError) {
          console.error("権限チェックエラー:", permError);
        }
      } catch (err) {
        console.error("Teams SDKの初期化に失敗しました:", err);
      }
    };

    initializeTeams();

    // クリーンアップ関数
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);  const startRecording = async () => {
    try {
      setError(null);

      // Teams環境での実行かどうかを確認
      const context = await microsoftTeams.app.getContext();
      console.log("Teams コンテキスト取得:", context);
      
      // このアプリに必要なデバイス権限を取得
      try {
        await microsoftTeams.app.initialize();
        
        // メディア権限の確認が必要な場合
        if (microsoftTeams.media) {
          console.log("メディア権限をリクエスト中...");
        }
      } catch (permError) {
        console.error("Teamsの初期化に失敗しました:", permError);
        setError(`Teams初期化エラー: ${permError instanceof Error ? permError.message : String(permError)}`);
        return;
      }
      
      try {
        // オーディオストリームを取得
        console.log("マイクのアクセス権限をリクエスト中...");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: false // ビデオは明示的に無効化
        });
        streamRef.current = stream;
        // オーディオ要素と接続
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
        }

        // MediaRecorderを設定
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          // 録音が停止したときの処理
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          if (audioRef.current) {
            audioRef.current.srcObject = null;
            audioRef.current.src = audioUrl;
            audioRef.current.load();
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("音声の取得に失敗しました:", err);
        setError(`音声の取得に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
      }
    } catch (err) {
      console.error("音声の取得に失敗しました:", err);
      setError(`音声の取得に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
      
      setIsRecording(false);
    }
  };

  return (
    <div className={styles.container}>
      <Title1>会議音声キャプチャ</Title1>
      <Text>マイクから音声をキャプチャします</Text>
      
      {error && (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      <div className={styles.buttonContainer}>
        <Button 
          appearance="primary" 
          onClick={startRecording} 
          disabled={isRecording}
        >
          録音開始
        </Button>
        <Button 
          onClick={stopRecording} 
          disabled={!isRecording}
        >
          録音停止
        </Button>
      </div>

      <audio ref={audioRef} controls className={styles.audio} />
    </div>
  );
};

export default AudioCapture;
