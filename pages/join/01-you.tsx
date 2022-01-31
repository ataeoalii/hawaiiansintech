import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import urlRegex from "url-regex";
import Head from "next/head";
import Link from "next/link";
import { Formik } from "formik";
import * as Yup from "yup";
import MetaTags from "../../components/Metatags.js";
import { Heading, Subheading } from "../../components/Heading";
import Button from "../../components/Button";
import Input from "../../components/form/Input";
import ProgressBar from "../../components/form/ProgressBar";
import { useStorage } from "../../lib/hooks";
import UndoButton from "../../components/form/UndoButton";

const NEXT_PAGE = "02-work";
const ALL_STORED_FIELDS = [
  "jfName",
  "jfLocation",
  "jfWebsite",
  "jfFocuses",
  "jfFocusSuggested",
  "jfTitle",
  "jfYearsExperience",
];
export const clearAllFields = () => {
  const { removeItem } = useStorage();
  ALL_STORED_FIELDS.map((item) => removeItem(item));
};

export default function JoinStep1(props) {
  const router = useRouter();
  const { getItem, setItem } = useStorage();
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [validateAfterSubmit, setValidateAfterSubmit] = useState(false);

  useEffect(() => {
    let storedName = getItem("jfName");
    let storedLocation = getItem("jfLocation");
    let storedWebsite = getItem("jfWebsite");
    if (storedName) setName(storedName);
    if (storedLocation) setLocation(storedLocation);
    if (storedWebsite) setWebsite(storedWebsite);
  }, []);

  const renderButton = () => {
    if (name || location || website)
      return (
        <div
          style={{
            border: "0.125rem solid var(--color-border)",
            borderRadius: "var(--border-radius-small)",
            padding: "1rem",
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "center",
            color: "var(--color-text-alt-2)",
          }}
        >
          <UndoButton
            onClick={() => {
              setName("");
              setLocation("");
              setWebsite("");
              clearAllFields();
            }}
          >
            Clear form
          </UndoButton>
        </div>
      );
  };

  return (
    <div className="container">
      <Head>
        <title>Hawaiians in Technology | Join</title>
        <link rel="icon" href="/favicon.ico" />
        <MetaTags />
      </Head>

      <Link href="/" shallow={true}>
        <a className="auxNav arrowback">←</a>
      </Link>
      <ProgressBar
        headline="Public"
        label="Who You Are"
        currentCount={1}
        totalCount={4}
      />
      <div style={{ marginTop: "4rem" }}>
        <Heading>Welcome to our little hui.</Heading>
      </div>
      <Subheading centered>
        Join our directory featuring talented kanaka working across the tech
        industry.
      </Subheading>
      <section
        style={{
          margin: "2rem auto 0",
          maxWidth: "var(--width-page-interior)",
        }}
      >
        {renderButton()}

        <Formik
          enableReinitialize
          initialValues={{ name: name, location: location, website: website }}
          validateOnBlur={validateAfterSubmit}
          validateOnChange={validateAfterSubmit}
          validate={() => {
            setValidateAfterSubmit(true);
          }}
          onSubmit={(values) => {
            setLoading(true);
            setItem("jfName", values.name);
            setItem("jfLocation", values.location);
            setItem("jfWebsite", values.website);
            router.push({ pathname: NEXT_PAGE });
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().required(
              "We need to know what to call you. Name is required."
            ),
            location: Yup.string().required(
              "A location, imprecise or not, is required."
            ),
            website: Yup.string()
              .matches(
                urlRegex({ strict: false }),
                "That URL looks funny. Please try again."
              )
              .required(
                "A website is required; think about a place where people can learn more about you."
              ),
          })}
        >
          {(props) => (
            <form onSubmit={props.handleSubmit}>
              <div style={{ marginBottom: "2rem" }}>
                <Input
                  name="name"
                  label="What’s your name?"
                  value={props.values.name}
                  labelTranslation="ʻO wai kou inoa?"
                  placeholder="Full name"
                  onBlur={props.handleBlur}
                  onChange={props.handleChange}
                  error={props.touched.name && props.errors.name}
                />
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <Input
                  name="location"
                  value={props.values.location}
                  label="Where you stay now days?"
                  labelTranslation="Ma hea ʻoe e noho ʻana?"
                  placeholder="City, State"
                  onBlur={props.handleBlur}
                  onChange={props.handleChange}
                  error={props.touched.location && props.errors.location}
                />
              </div>
              <Input
                name="website"
                value={props.values.website}
                label="What’s your LinkedIn / professional website?"
                labelTranslation="He aha kou wahi uila ’oihana?"
                onBlur={props.handleBlur}
                onChange={props.handleChange}
                error={props.touched.website && props.errors.website}
              />

              <div style={{ marginTop: "2rem" }}>
                <Button loading={loading} type="submit">
                  Continue
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </section>
    </div>
  );
}
