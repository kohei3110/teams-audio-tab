import { useContext, useState } from "react";
import { Button, Spinner } from "@fluentui/react-components";
import { useData } from "@microsoft/teamsfx-react";
import * as axios from "axios";
import { BearerTokenAuthProvider, createApiClient, TeamsUserCredential } from "@microsoft/teamsfx";
import { TeamsFxContext } from "../Context";
import config from "./lib/config";
import { createLogger } from "../../utils/logger";

const functionName = config.apiName || "myFunc";
const logger = createLogger({ context: 'AzureFunctions' });

async function callFunction(teamsUserCredential: TeamsUserCredential) {
  logger.info(`Azure Function '${functionName}' を呼び出し中...`);
  try {
    const apiBaseUrl = config.apiEndpoint + "/api/";
    logger.debug(`API Base URL: ${apiBaseUrl}`);
    
    // createApiClient(...) creates an Axios instance which uses BearerTokenAuthProvider to inject token to request header
    logger.debug("APIクライアントを作成中...");
    const apiClient = createApiClient(
      apiBaseUrl,
      new BearerTokenAuthProvider(async () => (await teamsUserCredential.getToken(""))!.token)
    );
    
    logger.debug(`APIエンドポイントにリクエスト送信: ${functionName}`);
    const response = await apiClient.get(functionName);
    logger.info(`Azure Function '${functionName}' の呼び出しに成功しました`);
    logger.debug("APIレスポンス:", response);
    
    return response.data;
  } catch (err: unknown) {
    logger.error(`Azure Function '${functionName}' の呼び出しに失敗しました`, err);
    
    if (axios.default.isAxiosError(err)) {
      let funcErrorMsg = "";

      if (err?.response?.status === 404) {
        logger.error("404エラー: Azure Functions App が見つかりません", err.response);
        funcErrorMsg = `There may be a problem with the deployment of Azure Functions App, please deploy Azure Functions (Run command palette "Microsoft 365 Agents: Deploy") first before running this App`;
      } else if (err.message === "Network Error") {
        logger.error("ネットワークエラー: Azure Functions に接続できません", err);
        funcErrorMsg =
          "Cannot call Azure Functions due to network error, please check your network connection status and ";
        if (err.config?.url && err.config.url.indexOf("localhost") >= 0) {
          funcErrorMsg += `make sure to start Azure Functions locally (Run "npm run start" command inside api folder from terminal) first before running this App`;
        } else {
          funcErrorMsg += `make sure to provision and deploy Azure Functions (Run command palette "Microsoft 365 Agents: Provision" and "Microsoft 365 Agents: Deploy") first before running this App`;
        }
      } else {
        funcErrorMsg = err.message;
        if (err.response?.data?.error) {
          funcErrorMsg += ": " + err.response.data.error;
        }
      }

      logger.error("エラーメッセージ:", funcErrorMsg);
      throw new Error(funcErrorMsg);
    }
    throw err;
  }
}

export function AzureFunctions(props: { codePath?: string; docsUrl?: string }) {
  const [needConsent, setNeedConsent] = useState(false);
  const { codePath, docsUrl } = {
    codePath: `api/src/functions/${functionName}.ts`,
    docsUrl: "https://aka.ms/teamsfx-azure-functions",
    ...props,
  };
  const teamsUserCredential = useContext(TeamsFxContext).teamsUserCredential;
  const { loading, data, error, reload } = useData(async () => {
    logger.debug("Azure Functions データをロード中...");
    if (!teamsUserCredential) {
      const errMsg = "TeamsFx SDK is not initialized.";
      logger.error(errMsg);
      throw new Error(errMsg);
    }
    if (needConsent) {
      logger.info("User.Read 権限の同意が必要です、ログイン要求を実行します");
      await teamsUserCredential!.login(["User.Read"]);
      logger.info("ログインと権限承認が完了しました");
      setNeedConsent(false);
    }
    try {
      logger.info("Azure Functions を呼び出し中...");
      const functionRes = await callFunction(teamsUserCredential);
      logger.info("Azure Functions からのレスポンスを受信しました");
      logger.debug("関数の結果:", functionRes);
      return functionRes;
    } catch (error: any) {
      logger.error("Azure Functionsの呼び出し中にエラーが発生しました:", error);
      if (error.message.includes("The application may not be authorized.")) {
        logger.info("アプリケーションが承認されていない可能性があります、同意が必要です");
        setNeedConsent(true);
      }
    }
  });
  return (
    <div>
      <h2>Call your Azure Functions</h2>
      <p>
        An Azure Functions app is running. Authorize this app and click below to call it for a
        response:
      </p>
      {!loading && (
        <Button appearance="primary" disabled={loading} onClick={reload}>
          Authorize and call Azure Functions
        </Button>
      )}
      {loading && (
        <pre className="fixed">
          <Spinner />
        </pre>
      )}
      {!loading && !!data && !error && <pre className="fixed">{JSON.stringify(data, null, 2)}</pre>}
      {!loading && !data && !error && <pre className="fixed"></pre>}
      {!loading && !!error && <div className="error fixed">{(error as any).toString()}</div>}
      <h4>How to edit the Azure Functions</h4>
      <p>
        See the code in <code>{codePath}</code> to add your business logic.
      </p>
      {!!docsUrl && (
        <p>
          For more information, see the{" "}
          <a href={docsUrl} target="_blank" rel="noreferrer">
            docs
          </a>
          .
        </p>
      )}
    </div>
  );
}
