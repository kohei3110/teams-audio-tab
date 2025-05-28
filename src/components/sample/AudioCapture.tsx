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
import { createLogger } from "../../utils/logger";

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
  // Logger instance for AudioCapture component
  const logger = createLogger({ context: 'AudioCapture' });
  // Teams SDKの初期化
  useEffect(() => {
    const initializeTeams = async () => {
      logger.info("Teams SDKの初期化を開始します...");
      try {
        // Teams SDKを初期化
        await microsoftTeams.app.initialize();
        logger.info("Teams SDKが正常に初期化されました");

        // Teams コンテキストを確認
        const context = await microsoftTeams.app.getContext();
        logger.debug("Teams コンテキスト取得:", context);
        logger.info(`Teams コンテキスト: ユーザー=${context.user?.userPrincipalName || '不明'}, アプリID=${context.app?.id || '不明'}`);
        
        try {
          // メディアデバイスが利用可能かチェック
          if (navigator.mediaDevices) {
            logger.info("getUserMedia APIが利用可能です");
            
            // マイクの権限状態を確認
            try {
              const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
              logger.info(`マイク権限の状態: ${permissionStatus.state}`);
            } catch (err) {
              logger.error("権限APIがサポートされていません", err);
            }
          } else {
            logger.warn("getUserMedia APIは利用できません - デバイスの音声機能が制限される可能性があります");
          }

          // Teams メディアAPIの確認
          if (microsoftTeams.media) {
            logger.info("Teams メディアAPIが利用可能です");
          } else {
            logger.warn("Teams メディアAPIは利用できません");
          }
        } catch (permError) {
          logger.error("権限チェックエラー:", permError);
        }
      } catch (err) {
        logger.error("Teams SDKの初期化に失敗しました:", err);
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
    logger.info("録音開始処理を実行します");
    try {
      setError(null);

      // Teams環境での実行かどうかを確認
      const context = await microsoftTeams.app.getContext();
      logger.debug("Teams コンテキスト取得:", context);
      logger.info(`Teams環境: ${context.app?.host?.name || '不明'} で実行中, ユーザー: ${context.user?.userPrincipalName || '不明'}`);
      
      // このアプリに必要なデバイス権限を取得
      try {
        logger.debug("Teams SDKを初期化中...");
        await microsoftTeams.app.initialize();
        logger.info("Teams SDK初期化完了");
        
        // メディア権限の確認が必要な場合
        if (microsoftTeams.media) {
          logger.info("メディア権限をリクエスト中...");
        } else {
          logger.warn("Teams メディアAPIは利用できません - 権限の確認ができない可能性があります");
        }
      } catch (permError) {
        logger.error("Teamsの初期化に失敗しました:", permError);
        setError(`Teams初期化エラー: ${permError instanceof Error ? permError.message : String(permError)}`);
        return;
      }
      
      try {
        // オーディオストリームを取得
        logger.info("マイクのアクセス権限をリクエスト中...");
        const constraints = { 
          audio: true,
          video: false // ビデオは明示的に無効化
        };
        logger.debug("メディアリクエスト設定:", constraints);
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        logger.info("マイクのアクセス権限を取得しました");
        logger.debug("取得したストリーム:", stream);
        
        streamRef.current = stream;
        
        // オーディオ要素と接続
        if (audioRef.current) {
          logger.debug("オーディオ要素とストリームを接続中");
          audioRef.current.srcObject = stream;
          logger.info("オーディオ要素にストリームを接続しました");
        } else {
          logger.warn("オーディオ要素が未定義のためストリーム接続をスキップします");
        }

        // MediaRecorderを設定
        logger.debug("MediaRecorderを初期化中...");
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        logger.info(`MediaRecorderを初期化しました (mimeType: ${mediaRecorder.mimeType})`);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            logger.debug(`録音データチャンク受信: ${event.data.size} bytes`);
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          // 録音が停止したときの処理
          logger.info("録音が停止されました、録音データを処理中...");
          const chunks = audioChunksRef.current;
          logger.debug(`録音データチャンク数: ${chunks.length}`);
          
          const audioBlob = new Blob(chunks, { type: "audio/wav" });
          logger.debug(`録音データBlobサイズ: ${audioBlob.size} bytes`);
          
          const audioUrl = URL.createObjectURL(audioBlob);
          logger.debug(`作成したオーディオURL: ${audioUrl}`);
          
          if (audioRef.current) {
            audioRef.current.srcObject = null;
            audioRef.current.src = audioUrl;
            audioRef.current.load();
            logger.info("録音データをオーディオ要素に設定しました");
          } else {
            logger.warn("オーディオ要素が未定義のためURLの設定をスキップします");
          }
        };

        logger.info("録音を開始します");
        mediaRecorder.start();
        logger.debug("MediaRecorder.start() が呼び出されました");
        setIsRecording(true);
      } catch (err) {
        logger.error("音声の取得に失敗しました:", err);
        setError(`音声の取得に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
      }
    } catch (err) {
      logger.error("録音開始処理でエラーが発生しました:", err);
      setError(`音声の取得に失敗しました: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const stopRecording = () => {
    logger.info("録音停止処理を実行します");
    if (mediaRecorderRef.current && isRecording) {
      logger.debug("MediaRecorderの停止を実行中...");
      mediaRecorderRef.current.stop();
      logger.info("MediaRecorderを停止しました");
      
      if (streamRef.current) {
        logger.debug("オーディオトラックを停止中...");
        const trackCount = streamRef.current.getTracks().length;
        logger.debug(`停止するトラック数: ${trackCount}`);
        
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          logger.debug(`トラック停止: kind=${track.kind}, id=${track.id}`);
        });
        
        logger.info("すべてのオーディオトラックを停止しました");
      } else {
        logger.warn("ストリームが存在しないためトラックの停止をスキップします");
      }
      
      setIsRecording(false);
    } else {
      logger.warn("録音が実行されていないか、MediaRecorderが未初期化のため録音停止をスキップします");
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
