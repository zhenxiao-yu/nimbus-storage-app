import { Models } from "node-appwrite";
import Link from "next/link";
import Thumbnail from "@/components/Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "@/components/FormattedDateTime";
import ActionDropdown from "@/components/ActionDropdown";

/**
 * Card Component
 * Displays a file's details in a card layout with a thumbnail, file size, actions, and metadata.
 *
 * @param file - The file document containing details like name, type, size, and owner.
 * @returns A styled card component with file details and actions.
 */
const Card = ({ file }: { file: Models.Document }) => {
  return (
    <Link
      href={file.url}
      target="_blank"
      className="file-card flex flex-col rounded-lg border-2 border-brand bg-white p-4 shadow-md transition-transform hover:shadow-lg"
    >
      {/* Thumbnail and Action Section */}
      <div className="flex items-center justify-between">
        {/* Thumbnail */}
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="!size-24"
          imageClassName="!size-16 rounded-md"
        />

        {/* Action Dropdown and File Size */}
        <div className="flex flex-col items-end space-y-2">
          <ActionDropdown file={file} />
          <p className="body-1">{convertFileSize(file.size)}</p>
        </div>
      </div>

      {/* File Details Section */}
      <div className="mt-4 space-y-1">
        {/* File Name */}
        <p className="line-clamp-1 text-base font-medium text-gray-700">
          {file.name}
        </p>

        {/* Creation Date */}
        <FormattedDateTime
          date={file.$createdAt}
          className="body-2 text-light-100"
        />

        {/* File Owner */}
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-gray-600">By:</span>{" "}
          {file.owner.fullName}
        </p>
      </div>
    </Link>
  );
};

export default Card;
